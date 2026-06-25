-- ============================================================
-- Fleet Management System — MySQL Schema
-- ============================================================
-- Run this once to set up your database:
--   mysql -u root -p < sql/schema.sql
-- OR import it via phpMyAdmin.
-- ============================================================

CREATE DATABASE IF NOT EXISTS fleet_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fleet_management;

-- ------------------------------------------------------------
-- users
-- Passwords stored as bcrypt hashes — never plain text.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)      NOT NULL UNIQUE,
  password   VARCHAR(255)     NOT NULL,
  full_name  VARCHAR(100)     NOT NULL,
  role       ENUM('admin','accountant') NOT NULL DEFAULT 'admin',
  status     ENUM('active','disabled')  NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- vehicles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_number VARCHAR(30)  NOT NULL UNIQUE,
  driver_name    VARCHAR(100) NOT NULL,
  vehicle_type   VARCHAR(50)  NOT NULL,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- fuel_entries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuel_entries (
  id             INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  vehicle_id     INT UNSIGNED   NOT NULL,
  driver_name    VARCHAR(100)   NOT NULL,
  fuel_type      ENUM('Petrol','Diesel') NOT NULL,
  liters         DECIMAL(8,2)   NOT NULL,
  amount         DECIMAL(10,2)  NOT NULL,
  entry_date     DATE           NOT NULL,
  slip_image     VARCHAR(255)   DEFAULT NULL,
  created_by     INT UNSIGNED   DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_entry_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT fk_entry_user
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_entry_date  (entry_date),
  INDEX idx_vehicle_id  (vehicle_id)
) ENGINE=InnoDB;

-- ============================================================
-- Seed data
-- ============================================================

-- Default credentials → username: admin | password: admin123
INSERT INTO users (username, password, full_name, role) VALUES
('admin',
 '$2a$10$wnwFGBOefVlX1HKmDNfVOeIBNFTwEbVMuMi8vxcbFRkMJtMl/FFAK',
 'Admin User',
 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Sample vehicles
INSERT INTO vehicles (vehicle_number, driver_name, vehicle_type) VALUES
('LEA-4471', 'Imran Khalid',   'Delivery Van'),
('LES-2290', 'Bilal Ahmed',    'Pickup Truck'),
('KHI-7732', 'Faisal Mehmood', 'Mini Truck')
ON DUPLICATE KEY UPDATE vehicle_number = vehicle_number;

-- Sample fuel entries (inserted only if the vehicles above exist)
INSERT INTO fuel_entries (vehicle_id, driver_name, fuel_type, liters, amount, entry_date, created_by)
SELECT v.id, v.driver_name, 'Petrol', 22.50,  8500.00, '2026-06-18', u.id
FROM vehicles v, users u WHERE v.vehicle_number = 'LEA-4471' AND u.username = 'admin' LIMIT 1;

INSERT INTO fuel_entries (vehicle_id, driver_name, fuel_type, liters, amount, entry_date, created_by)
SELECT v.id, v.driver_name, 'Diesel', 18.00,  6200.00, '2026-06-18', u.id
FROM vehicles v, users u WHERE v.vehicle_number = 'LES-2290' AND u.username = 'admin' LIMIT 1;

INSERT INTO fuel_entries (vehicle_id, driver_name, fuel_type, liters, amount, entry_date, created_by)
SELECT v.id, v.driver_name, 'Diesel', 26.40,  9100.00, '2026-06-17', u.id
FROM vehicles v, users u WHERE v.vehicle_number = 'KHI-7732' AND u.username = 'admin' LIMIT 1;
