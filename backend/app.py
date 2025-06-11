from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from config import MYSQL_CONFIG

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

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
def get_tasks():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tasks (title, description) VALUES (%s, %s)", (data['title'], data['description']))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Task created'}), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
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
def delete_task(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id=%s", (task_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Task deleted'})

if __name__ == '__main__':
    app.run(debug=True)
