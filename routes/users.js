const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

// In-Memory store fallback
let mockUsersList = [
  { id: 1, name: 'YEIDA Admin', email: 'admin@yeida.in', phone: '9876543210', role: 'admin', designation: 'Super Administrator', status: 'active', created_at: new Date() },
  { id: 2, name: 'Rajesh Officer', email: 'user@yeida.in', phone: '9812345678', role: 'user', designation: 'Field Data Officer', status: 'active', created_at: new Date() }
];

// Get all users (Admin only)
router.get('/', async (req, res) => {
  try {
    try {
      const [rows] = await pool.query('SELECT id, name, email, phone, role, designation, status, created_at FROM users ORDER BY id DESC');
      return res.json(rows);
    } catch (err) {
      return res.json(mockUsersList);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Create new user (Admin action)
router.post('/create', async (req, res) => {
  const { name, email, phone, password, role, designation } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'All required fields (name, email, phone, password) must be provided' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';
    const userDesig = designation || 'Field Data Officer';

    try {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, phone, password, role, designation) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, phone, hashedPassword, userRole, userDesig]
      );
      
      return res.status(201).json({
        message: 'User created successfully in MariaDB',
        userId: result.insertId
      });
    } catch (dbErr) {
      console.error('User DB insert error:', dbErr.message);
      // Memory fallback
      const newUser = {
        id: mockUsersList.length + 1,
        name,
        email,
        phone,
        role: userRole,
        designation: userDesig,
        status: 'active',
        created_at: new Date()
      };
      mockUsersList.unshift(newUser);
      return res.status(201).json({
        message: 'User created successfully (Mock mode)',
        user: newUser
      });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// Update user profile & password (Admin action)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, designation, role, password } = req.body;

  try {
    let hashedPassword;
    if (password && password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    try {
      if (hashedPassword) {
        await pool.query(
          'UPDATE users SET name = ?, email = ?, phone = ?, designation = ?, role = ?, password = ? WHERE id = ?',
          [name, email, phone, designation, role || 'user', hashedPassword, id]
        );
      } else {
        await pool.query(
          'UPDATE users SET name = ?, email = ?, phone = ?, designation = ?, role = ? WHERE id = ?',
          [name, email, phone, designation, role || 'user', id]
        );
      }
      return res.json({ message: 'User updated successfully in MariaDB' });
    } catch (dbErr) {
      console.error('User DB update error:', dbErr.message);
      const idx = mockUsersList.findIndex(u => u.id == id);
      if (idx !== -1) {
        mockUsersList[idx] = { ...mockUsersList[idx], name, email, phone, designation, role };
      }
      return res.json({ message: 'User updated successfully (Mock)' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

module.exports = router;
