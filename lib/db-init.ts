import pool from './db'

export async function initDB() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      avatar VARCHAR(255),
      role ENUM('ADMIN','PETUGAS','USER') DEFAULT 'USER',
      points INT DEFAULT 0,
      level INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS waste_categories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      point_per_kg INT NOT NULL,
      price_per_kg DECIMAL(10,2) NOT NULL
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS waste_deposits (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      category_id VARCHAR(36) NOT NULL,
      weight DECIMAL(10,2) NOT NULL,
      point INT NOT NULL,
      photo VARCHAR(255),
      status ENUM('PENDING','VERIFIED','REJECTED') DEFAULT 'PENDING',
      verified_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS pickup_requests (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      address TEXT NOT NULL,
      scheduled_at DATETIME NOT NULL,
      status ENUM('WAITING','SCHEDULED','ON_THE_WAY','DONE') DEFAULT 'WAITING',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS waste_reports (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      photo VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      status ENUM('REPORTED','ON_PROGRESS','COMPLETED') DEFAULT 'REPORTED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS rewards (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      point_required INT NOT NULL,
      stock INT NOT NULL,
      category VARCHAR(100),
      image VARCHAR(255)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS point_transactions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      point_in INT DEFAULT 0,
      point_out INT DEFAULT 0,
      note VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('Database tables ready')
}
