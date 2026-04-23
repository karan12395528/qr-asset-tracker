-- QR Asset Tracker - Database Migration (Multi-Tenant Phase 2)
-- Run this script on TiDB Cloud to reset and rebuild the full schema

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS checkouts;
DROP TABLE IF EXISTS accessories;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (superadmin, admin, staff)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Categories table (predefined per company, prevents typos)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_per_company (name, company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Assets table (category_id FK to categories)
CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  category_id INT DEFAULT NULL,
  location VARCHAR(150) DEFAULT 'Main Office',
  status ENUM('available', 'checked-out') DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tag_per_company (tag, company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Accessories table
CREATE TABLE IF NOT EXISTS accessories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
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
