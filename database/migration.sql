-- QR Asset Tracker - Database Migration (Multi-Tenant)
-- Run this script to reset and set up the multi-tenant database

DROP DATABASE IF EXISTS qr_asset_tracker;
CREATE DATABASE qr_asset_tracker;
USE qr_asset_tracker;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  location VARCHAR(150) DEFAULT 'Main Office',
  status ENUM('available', 'checked-out') DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tag_per_company (tag, company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Checkouts table
CREATE TABLE IF NOT EXISTS checkouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  asset_id INT NOT NULL,
  user_id INT NOT NULL,
  checkout_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  return_time TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  asset_id INT,
  action VARCHAR(100) NOT NULL,
  performed_by INT,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Note: We do not create a default admin user anymore. 
-- The first client who registers via the UI will create the first company and admin account.
