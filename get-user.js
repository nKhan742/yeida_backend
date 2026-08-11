const { pool } = require('./db');

async function getUserDetails() {
  const args = process.argv.slice(2);
  const identifier = args[0]; // Optional User ID or Email

  try {
    if (!identifier) {
      const [rows] = await pool.query('SELECT id, name, email, phone, role, designation, status, created_at FROM users ORDER BY id ASC');
      console.log('\n📋 All Registered Users:\n');
      console.table(rows);
    } else {
      const isEmail = String(identifier).includes('@');
      const query = isEmail
        ? 'SELECT id, name, email, phone, role, designation, status, created_at FROM users WHERE email = ?'
        : 'SELECT id, name, email, phone, role, designation, status, created_at FROM users WHERE id = ?';

      const [rows] = await pool.query(query, [identifier]);

      if (rows.length > 0) {
        console.log(`\n👤 User Details for ${isEmail ? 'email' : 'ID'}: ${identifier}\n`);
        console.table(rows[0]);
      } else {
        console.log(`\n⚠️ No user found with ${isEmail ? 'email' : 'ID'}: ${identifier}\n`);
      }
    }
  } catch (error) {
    console.error('\n❌ Database error:', error.message, '\n');
  } finally {
    process.exit(0);
  }
}

getUserDetails();
