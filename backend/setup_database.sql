-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS quicktask;

-- Switch to the quicktask database
USE quicktask;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    completed TINYINT(1) DEFAULT 0,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 