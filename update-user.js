const { pool } = require('./db');

async function updateUserName() {
  const args = process.argv.slice(2);
  const identifier = args[0]; // User ID or Email
  const newName = args[1];    // New name string

  if (!identifier || !newName) {
    console.log('\n❌ Usage: node update-user.js <userId_or_email> "<newName>"\n');
    console.log('Examples:');
    console.log('  node update-user.js 2 "Ravish Kumar"');
    console.log('  node update-user.js officer1@yeida.in "Ravish Kumar"\n');
    process.exit(1);
  }

  try {
    const isEmail = String(identifier).includes('@');
    const query = isEmail
      ? 'UPDATE users SET name = ? WHERE email = ?'
      : 'UPDATE users SET name = ? WHERE id = ?';

    const [result] = await pool.query(query, [newName, identifier]);

    if (result.affectedRows > 0) {
      console.log(`\n✅ Successfully updated user name to: "${newName}" for ${isEmail ? 'email' : 'ID'}: ${identifier}\n`);
    } else {
      console.log(`\n⚠️ No user found with ${isEmail ? 'email' : 'ID'}: ${identifier}\n`);
    }
  } catch (error) {
    console.error('\n❌ Database error:', error.message, '\n');
  } finally {
    process.exit(0);
  }
}

updateUserName();
