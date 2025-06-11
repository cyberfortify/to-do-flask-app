-- setup.sql → QuickTask MySQL Database Setup

-- Create database
CREATE DATABASE quicktask;

-- Use database
USE quicktask;

-- Create tasks table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE
);
