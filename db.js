const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yeida_db',
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to test DB connection
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MariaDB successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.warn('MariaDB connection warning (Backend will run in mock mode if DB unavailable):', error.message);
    return false;
  }
}

module.exports = { pool, checkConnection };
