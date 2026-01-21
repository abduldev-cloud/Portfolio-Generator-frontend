CREATE DATABASE IF NOT EXISTS portfolio_generator;
USE portfolio_generator;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  content JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  file_path VARCHAR(255) NOT NULL
);

INSERT INTO users (id, email, password) VALUES (1, 'test@example.com', 'hashed_password');

INSERT INTO templates (name, description, file_path) VALUES 
('Modern Minimal', 'A clean and minimalist design for professionals.', 'templates/modern-minimal.zip'),
('Creative Dark', 'A bold and dark theme for creatives.', 'templates/creative-dark.zip');
