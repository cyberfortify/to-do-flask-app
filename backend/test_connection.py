import sys
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def check_python_version():
    logger.info(f"Python version: {sys.version}")
    return True

def check_dependencies():
    try:
        import flask
        import flask_cors
        import mysql.connector
        import jwt
        import bcrypt
        logger.info("All required packages are installed")
        return True
    except ImportError as e:
        logger.error(f"Missing package: {str(e)}")
        return False

def check_mysql_connection():
    try:
        from config import MYSQL_CONFIG
        import mysql.connector
        
        logger.info("Attempting to connect to MySQL...")
        logger.info(f"Connection config: {MYSQL_CONFIG}")
        
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = connection.cursor()
        
        # Test database connection
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        logger.info(f"MySQL version: {version[0]}")
        
        # Test database existence
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        logger.info(f"Available databases: {databases}")
        
        if MYSQL_CONFIG['database'] not in databases:
            logger.error(f"Database '{MYSQL_CONFIG['database']}' does not exist!")
            return False
            
        # Test tables
        cursor.execute(f"USE {MYSQL_CONFIG['database']}")
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        logger.info(f"Tables in database: {tables}")
        
        cursor.close()
        connection.close()
        logger.info("MySQL connection test successful")
        return True
        
    except Exception as e:
        logger.error(f"MySQL connection error: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def main():
    logger.info("Starting connection tests...")
    
    # Check Python version
    if not check_python_version():
        logger.error("Python version check failed")
        return
    
    # Check dependencies
    if not check_dependencies():
        logger.error("Dependencies check failed")
        return
    
    # Check MySQL connection
    if not check_mysql_connection():
        logger.error("MySQL connection check failed")
        return
    
    logger.info("All tests passed successfully!")

if __name__ == "__main__":
    main() 