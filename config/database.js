const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Khởi tạo bảng
async function initDatabase() {
  const client = await pool.connect();
  try {
    // Tạo bảng articles với đầy đủ các cột mới
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100),
        skin_type VARCHAR(100),
        price_range VARCHAR(50),
        excerpt TEXT,
        content TEXT NOT NULL,
        thumbnail VARCHAR(500),
        affiliate_link VARCHAR(500),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tạo bảng users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables ready');
  } catch (error) {
    console.error('❌ Database init error:', error.message);
  } finally {
    client.release();
  }
}

initDatabase();

module.exports = pool;