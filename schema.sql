-- Yamuna Expressway Industrial Development Authority (YEIDA)
-- MariaDB Database Initialization Script

CREATE DATABASE IF NOT EXISTS yeida_db;
USE yeida_db;

-- Table 1: Users (Admin and Data Entry Officers)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  designation VARCHAR(100) DEFAULT 'Data Entry Officer',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Land Entries
CREATE TABLE IF NOT EXISTS land_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_code VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  sector VARCHAR(100) NOT NULL,
  village VARCHAR(100) NOT NULL,
  khasra_no VARCHAR(100) NOT NULL,
  total_area DECIMAL(12,2) NOT NULL,
  farmer_name VARCHAR(150) NOT NULL,
  farmer_share_area DECIMAL(12,2) NOT NULL,
  registry_date DATE NOT NULL,
  registry_by VARCHAR(150) NOT NULL,
  compensation_amount DECIMAL(14,2) NOT NULL,
  stamp_duty DECIMAL(14,2) NOT NULL,
  registration_fees DECIMAL(14,2) NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  aadhaar_no VARCHAR(16) NOT NULL,
  aadhaar_doc VARCHAR(255),
  pan_no VARCHAR(10) NOT NULL,
  pan_doc VARCHAR(255),
  bank_name VARCHAR(100),
  account_no VARCHAR(50),
  ifsc_code VARCHAR(20),
  cheque_doc VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Initial Admin Seed User (Password: admin123)
-- Hash generated via bcrypt
INSERT IGNORE INTO users (id, name, email, phone, password, role, designation) 
VALUES (1, 'YEIDA System Admin', 'admin@yeida.in', '9876543210', '$2a$10$wN9P3PjSj/O9uE.TzG/L2.h6H7R1vQ1f4jX8aQyFm4/W7bE2g0mC6', 'admin', 'Super Administrator');

-- Initial Standard Officer User (Password: user123)
INSERT IGNORE INTO users (id, name, email, phone, password, role, designation) 
VALUES (2, 'Rajesh Kumar', 'officer1@yeida.in', '9812345678', '$2a$10$wN9P3PjSj/O9uE.TzG/L2.h6H7R1vQ1f4jX8aQyFm4/W7bE2g0mC6', 'user', 'Senior Land Officer');
