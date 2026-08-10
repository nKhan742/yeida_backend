const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('📦 Connected to MariaDB/MySQL server...');

    // 1. Execute schema.sql to create database and tables
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Created database "yeida_db" and table structures.');

    // 2. Select yeida_db
    await connection.changeUser({ database: 'yeida_db' });

    // 3. Seed land entries
    const seedEntriesSql = `
      INSERT IGNORE INTO land_entries 
      (id, entry_code, user_id, sector, village, khasra_no, total_area, farmer_name, farmer_share_area, registry_date, registry_by, compensation_amount, stamp_duty, registration_fees, total_amount, phone, aadhaar_no, pan_no, bank_name, account_no, ifsc_code, status) 
      VALUES 
      (1, 'YEIDA/2026/001', 2, 'Sector 22D', 'Dungarpur Rilka', '452 / 1', 12500.50, 'Shri Ram Chander', 6250.25, '2026-03-15', 'Tehsildar Jewar', 4500000.00, 225000.00, 45000.00, 4770000.00, '9876543210', '5412 8963 1204', 'ABCDE1234F', 'State Bank of India', '30215487965', 'SBIN0004521', 'approved'),
      (2, 'YEIDA/2026/002', 2, 'Sector 18', 'Bhatta Parsaul', '108 / 3', 8400.00, 'Smt. Sunita Devi', 8400.00, '2026-03-18', 'ADM Land Acquisition', 3200000.00, 160000.00, 32000.00, 3392000.00, '9811223344', '8899 4411 2233', 'XYZPS9876K', 'Punjab National Bank', '0412000100234', 'PUNB0041200', 'pending');
    `;
    await connection.query(seedEntriesSql);
    console.log('🌱 Seed data added successfully into "users" and "land_entries" tables!');

    await connection.end();
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}

seedDatabase();
