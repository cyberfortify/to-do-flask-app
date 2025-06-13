from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from config import MYSQL_CONFIG
import jwt
import datetime
import bcrypt
import traceback
import logging
import os
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS properly
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# JWT configuration
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this to a secure secret key

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Read the schema file
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
        
        # Split the SQL file into individual statements
        statements = schema_sql.split(';')
        
        # Execute each statement separately
        for statement in statements:
            if statement.strip():  # Skip empty statements
                cursor.execute(statement)
        
        conn.commit()
        logger.info("Database schema initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database schema: {str(e)}")
        logger.error(traceback.format_exc())
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def get_db_connection():
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        logger.info("Successfully connected to MySQL database")
        return connection
    except mysql.connector.Error as err:
        logger.error(f"Error connecting to MySQL database: {err}")
        raise

# Initialize database on startup
init_db()

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def get_user_from_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/health')
def health_check():
    try:
        # Test database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.datetime.now().isoformat()
        }), 500

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        logger.debug(f"Signup request data: {data}")
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not all([name, email, password]):
            return jsonify({'error': 'All fields are required'}), 400

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE username = %s", (email,))
            if cursor.fetchone():
                return jsonify({'error': 'Email already registered'}), 400

            # Insert new user
            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                (email, hashed_password)
            )
            conn.commit()
            user_id = cursor.lastrowid

            # Generate token
            token = generate_token(user_id)

            return jsonify({
                'message': 'User created successfully',
                'token': token,
                'user': {
                    'id': user_id,
                    'name': name,
                    'email': email
                }
            }), 201

        except mysql.connector.Error as err:
            logger.error(f"MySQL error during signup: {err}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        logger.debug(f"Login request data: {data}")
        
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({'error': 'Email and password are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Get user
            cursor.execute("SELECT * FROM users WHERE username = %s", (email,))
            user = cursor.fetchone()

            if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return jsonify({'error': 'Invalid email or password'}), 401

            # Generate token
            token = generate_token(user['id'])

            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['username']
                }
            }), 200

        except mysql.connector.Error as err:
            logger.error(f"MySQL error during login: {err}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            logger.warning("No token provided in request")
            return jsonify({'error': 'Token is missing'}), 401
            
        try:
            # Decode the token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            logger.info(f"Decoded token data: {data}")
            
            # Get user from database
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, username FROM users WHERE id = %s", (data['user_id'],))
            current_user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not current_user:
                logger.warning(f"User not found for token: {data['user_id']}")
                return jsonify({'error': 'User not found'}), 401
                
            logger.info(f"Current user found: {current_user}")
            return f(current_user, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            logger.error(f"Error in token_required: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': 'Internal server error'}), 500
            
    return decorated

@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    try:
        logger.info(f"Fetching tasks for user: {current_user['id']}")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            # Get tasks for the current user
            cursor.execute(
                "SELECT id, title, description, completed, user_id FROM tasks WHERE user_id = %s ORDER BY id DESC",
                (current_user['id'],)
            )
            tasks = cursor.fetchall()
            
            # Convert completed field to boolean
            for task in tasks:
                task['completed'] = bool(task['completed'])
            
            logger.info(f"Successfully fetched {len(tasks)} tasks")
            return jsonify(tasks), 200
            
        except mysql.connector.Error as err:
            logger.error(f"MySQL error while fetching tasks: {err}")
            logger.error(f"Error code: {err.errno}")
            logger.error(f"SQL state: {err.sqlstate}")
            logger.error(f"Error message: {err.msg}")
            return jsonify({"error": "Database error occurred"}), 500
            
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user):
    try:
        data = request.get_json()
        logger.info(f"Creating task for user {current_user['id']}: {data}")
        
        if not data:
            logger.error("No data provided in request")
            return jsonify({"error": "No data provided"}), 400
            
        if 'title' not in data:
            logger.error("Title is missing in request data")
            return jsonify({"error": "Title is required"}), 400
            
        # Log the current user data
        logger.info(f"Current user data: {current_user}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Log the SQL query and parameters
            query = "INSERT INTO tasks (title, description, completed, user_id) VALUES (%s, %s, %s, %s)"
            params = (
                data['title'],
                data.get('description', ''),
                data.get('completed', False),
                current_user['id']
            )
            logger.info(f"Executing query: {query} with params: {params}")
            
            cursor.execute(query, params)
            
            conn.commit()
            task_id = cursor.lastrowid
            logger.info(f"Task created with ID: {task_id}")
            
            # Fetch the created task
            cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
            task = cursor.fetchone()
            
            if not task:
                logger.error(f"Failed to fetch created task with ID {task_id}")
                return jsonify({"error": "Failed to create task"}), 500
                
            # Convert task to dictionary
            task_dict = {
                'id': task[0],
                'title': task[1],
                'description': task[2],
                'completed': bool(task[3]),
                'user_id': task[4]
            }
            
            logger.info(f"Successfully created task: {task_dict}")
            return jsonify(task_dict), 201
            
        except mysql.connector.Error as err:
            logger.error(f"MySQL error while creating task: {err}")
            logger.error(f"Error code: {err.errno}")
            logger.error(f"SQL state: {err.sqlstate}")
            logger.error(f"Error message: {err.msg}")
            logger.error(f"Full error details: {traceback.format_exc()}")
            return jsonify({"error": "Database error occurred"}), 500
            
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        logger.error(f"Full error details: {traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json
        logger.debug(f"Update task request data: {data}")

        title = data.get('title')
        description = data.get('description')
        completed = data.get('completed')

        if not any([title, description, completed is not None]):
            return jsonify({'error': 'No valid fields to update'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # First check if task exists and belongs to user
            cursor.execute("SELECT * FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
            task = cursor.fetchone()
            if not task:
                return jsonify({'error': 'Task not found'}), 404

            # Build update query dynamically based on provided fields
            update_fields = []
            params = []
            if title is not None:
                update_fields.append("title = %s")
                params.append(title)
            if description is not None:
                update_fields.append("description = %s")
                params.append(description)
            if completed is not None:
                update_fields.append("completed = %s")
                params.append(1 if completed else 0)

            if update_fields:
                query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = %s AND user_id = %s"
                params.extend([task_id, user_id])
                cursor.execute(query, params)
                conn.commit()

                # Get updated task
                cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
                updated_task = cursor.fetchone()
                return jsonify(updated_task)

            return jsonify(task)

        except mysql.connector.Error as err:
            logger.error(f"MySQL error while updating task: {err}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # Check if task exists and belongs to user
            cursor.execute("SELECT id FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
            if not cursor.fetchone():
                return jsonify({'error': 'Task not found'}), 404

            cursor.execute("DELETE FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
            conn.commit()
            return jsonify({'message': 'Task deleted successfully'})

        except mysql.connector.Error as err:
            logger.error(f"MySQL error while deleting task: {err}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return """
    <h1>Welcome to QuickTask API</h1>
    <p>Available Endpoints:</p>
    <ul>
      <li>GET /tasks → Retrieve all tasks</li>
      <li>POST /tasks → Create a new task</li>
      <li>PUT /tasks/&lt;id&gt; → Update task</li>
      <li>DELETE /tasks/&lt;id&gt; → Delete task</li>
    </ul>
    """

@app.route('/tasks', methods=['GET'])
def get_tasks_old():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def create_task_old():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tasks (title, description) VALUES (%s, %s)", (data['title'], data['description']))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Task created'}), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task_old(task_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE tasks SET title=%s, description=%s, completed=%s WHERE id=%s",
        (data['title'], data['description'], data['completed'], task_id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Task updated'})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task_old(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id=%s", (task_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Task deleted'})

if __name__ == '__main__':
    try:
        # Test database connection before starting the server
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()  # Fetch the result
        cursor.close()
        conn.close()
        logger.info("Database connection test successful")
        
        # Start the Flask app
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        logger.error(traceback.format_exc())
