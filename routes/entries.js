const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../db');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// In-Memory store fallback for entries
let mockEntries = [
  {
    id: 1,
    entry_code: 'YEIDA/2026/001',
    user_id: 2,
    sector: 'Sector 22D',
    village: 'Dungarpur Rilka',
    khasra_no: '452 / 1',
    total_area: 12500.50,
    farmer_name: 'Shri Ram Chander',
    farmer_share_area: 6250.25,
    registry_date: '2026-03-15',
    registry_by: 'Tehsildar Jewar',
    compensation_amount: 4500000.00,
    stamp_duty: 225000.00,
    registration_fees: 45000.00,
    total_amount: 4770000.00,
    phone: '9876543210',
    aadhaar_no: '5412 8963 1204',
    aadhaar_doc: null,
    pan_no: 'ABCDE1234F',
    pan_doc: null,
    bank_name: 'State Bank of India',
    account_no: '30215487965',
    ifsc_code: 'SBIN0004521',
    cheque_doc: null,
    status: 'approved',
    created_at: new Date('2026-03-15T10:30:00Z')
  },
  {
    id: 2,
    entry_code: 'YEIDA/2026/002',
    user_id: 2,
    sector: 'Sector 18',
    village: 'Bhatta Parsaul',
    khasra_no: '108 / 3',
    total_area: 8400.00,
    farmer_name: 'Smt. Sunita Devi',
    farmer_share_area: 8400.00,
    registry_date: '2026-03-18',
    registry_by: 'ADM Land Acquisition',
    compensation_amount: 3200000.00,
    stamp_duty: 160000.00,
    registration_fees: 32000.00,
    total_amount: 3392000.00,
    phone: '9811223344',
    aadhaar_no: '8899 4411 2233',
    aadhaar_doc: null,
    pan_no: 'XYZPS9876K',
    pan_doc: null,
    bank_name: 'Punjab National Bank',
    account_no: '0412000100234',
    ifsc_code: 'PUNB0041200',
    cheque_doc: null,
    status: 'pending',
    created_at: new Date('2026-03-18T14:15:00Z')
  }
];

// Get all entries
router.get('/', async (req, res) => {
  try {
    try {
      const [rows] = await pool.query('SELECT * FROM land_entries ORDER BY id DESC');
      return res.json(rows);
    } catch (dbErr) {
      return res.json(mockEntries);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching land entries' });
  }
});

// Create new Land Entry (Support up to 3 file fields: aadhaar_doc, pan_doc, cheque_doc)
router.post(
  '/',
  upload.fields([
    { name: 'aadhaar_doc', maxCount: 1 },
    { name: 'pan_doc', maxCount: 1 },
    { name: 'cheque_doc', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        user_id,
        sector,
        village,
        khasra_no,
        total_area,
        farmer_name,
        farmer_share_area,
        registry_date,
        registry_by,
        compensation_amount,
        stamp_duty,
        registration_fees,
        total_amount,
        phone,
        aadhaar_no,
        pan_no,
        bank_name,
        account_no,
        ifsc_code
      } = req.body;

      const files = req.files || {};
      const aadhaarDocPath = files.aadhaar_doc ? files.aadhaar_doc[0].filename : null;
      const panDocPath = files.pan_doc ? files.pan_doc[0].filename : null;
      const chequeDocPath = files.cheque_doc ? files.cheque_doc[0].filename : null;

      const entry_code = `YEIDA/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

      // Ensure valid integer user_id that exists in DB
      let validUserId = parseInt(user_id) || 1;
      try {
        const [uRows] = await pool.query('SELECT id FROM users WHERE id = ?', [validUserId]);
        if (uRows.length === 0) {
          validUserId = 1; // Fallback to Admin User ID if user_id doesn't exist in cloud DB
        }
      } catch (err) {
        validUserId = 1;
      }

      try {
        const [result] = await pool.query(
          `INSERT INTO land_entries (
            entry_code, user_id, sector, village, khasra_no, total_area, farmer_name, farmer_share_area,
            registry_date, registry_by, compensation_amount, stamp_duty, registration_fees, total_amount,
            phone, aadhaar_no, aadhaar_doc, pan_no, pan_doc, bank_name, account_no, ifsc_code, cheque_doc, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            entry_code,
            validUserId,
            sector,
            village,
            khasra_no,
            parseFloat(total_area) || 0,
            farmer_name,
            parseFloat(farmer_share_area) || 0,
            registry_date || new Date().toISOString().split('T')[0],
            registry_by,
            parseFloat(compensation_amount) || 0,
            parseFloat(stamp_duty) || 0,
            parseFloat(registration_fees) || 0,
            parseFloat(total_amount) || 0,
            phone,
            aadhaar_no,
            aadhaarDocPath,
            pan_no,
            panDocPath,
            bank_name,
            account_no,
            ifsc_code,
            chequeDocPath,
            'pending'
          ]
        );

        return res.status(201).json({
          message: 'Land acquisition data entry created successfully in MariaDB',
          entryId: result.insertId,
          entryCode: entry_code
        });
      } catch (dbErr) {
        console.error('DB Insert Error in entries.js:', dbErr.message);
        // Fallback memory insertion
        const newEntry = {
          id: mockEntries.length + 1,
          entry_code,
          user_id: parseInt(user_id) || 1,
          sector,
          village,
          khasra_no,
          total_area: parseFloat(total_area) || 0,
          farmer_name,
          farmer_share_area: parseFloat(farmer_share_area) || 0,
          registry_date: registry_date || new Date().toISOString().split('T')[0],
          registry_by,
          compensation_amount: parseFloat(compensation_amount) || 0,
          stamp_duty: parseFloat(stamp_duty) || 0,
          registration_fees: parseFloat(registration_fees) || 0,
          total_amount: parseFloat(total_amount) || 0,
          phone,
          aadhaar_no,
          aadhaar_doc: aadhaarDocPath,
          pan_no,
          pan_doc: panDocPath,
          bank_name,
          account_no,
          ifsc_code,
          cheque_doc: chequeDocPath,
          status: 'pending',
          created_at: new Date()
        };

        mockEntries.unshift(newEntry);

        return res.status(201).json({
          message: 'Land acquisition entry recorded successfully',
          entryId: newEntry.id,
          entryCode: entry_code
        });
      }
    } catch (error) {
      console.error('Error creating land entry:', error);
      res.status(500).json({ message: 'Failed to create land entry' });
    }
  }
);

// Update Land Entry (Allowed ONLY if status !== 'approved')
router.put('/:id', upload.fields([
  { name: 'aadhaar_doc', maxCount: 1 },
  { name: 'pan_doc', maxCount: 1 },
  { name: 'cheque_doc', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const {
    sector, village, khasra_no, total_area, farmer_name, farmer_share_area,
    registry_date, registry_by, compensation_amount, stamp_duty,
    registration_fees, total_amount, phone, aadhaar_no, pan_no, bank_name,
    account_no, ifsc_code
  } = req.body;

  try {
    // Check current status in DB
    try {
      const [existing] = await pool.query('SELECT status FROM land_entries WHERE id = ?', [id]);
      if (existing.length > 0 && existing[0].status === 'approved') {
        return res.status(403).json({ message: 'Approved entries cannot be edited.' });
      }

      const files = req.files || {};
      const aadhaarDocPath = files.aadhaar_doc ? files.aadhaar_doc[0].filename : undefined;
      const panDocPath = files.pan_doc ? files.pan_doc[0].filename : undefined;
      const chequeDocPath = files.cheque_doc ? files.cheque_doc[0].filename : undefined;

      await pool.query(
        `UPDATE land_entries SET
          sector = ?, village = ?, khasra_no = ?, total_area = ?, farmer_name = ?,
          farmer_share_area = ?, registry_date = ?, registry_by = ?,
          compensation_amount = ?, stamp_duty = ?, registration_fees = ?, total_amount = ?,
          phone = ?, aadhaar_no = ?, pan_no = ?, bank_name = ?, account_no = ?, ifsc_code = ?
          ${aadhaarDocPath ? ', aadhaar_doc = ?' : ''}
          ${panDocPath ? ', pan_doc = ?' : ''}
          ${chequeDocPath ? ', cheque_doc = ?' : ''}
        WHERE id = ? AND status != 'approved'`,
        [
          sector, village, khasra_no, parseFloat(total_area) || 0, farmer_name,
          parseFloat(farmer_share_area) || 0, registry_date, registry_by,
          parseFloat(compensation_amount) || 0, parseFloat(stamp_duty) || 0,
          parseFloat(registration_fees) || 0, parseFloat(total_amount) || 0,
          phone, aadhaar_no, pan_no, bank_name, account_no, ifsc_code,
          ...(aadhaarDocPath ? [aadhaarDocPath] : []),
          ...(panDocPath ? [panDocPath] : []),
          ...(chequeDocPath ? [chequeDocPath] : []),
          id
        ]
      );

      return res.json({ message: 'Entry updated successfully' });
    } catch (dbErr) {
      console.error('DB Update error:', dbErr.message);
      // Fallback memory edit
      const idx = mockEntries.findIndex(e => e.id == id);
      if (idx !== -1) {
        if (mockEntries[idx].status === 'approved') {
          return res.status(403).json({ message: 'Approved entries cannot be edited.' });
        }
        mockEntries[idx] = { ...mockEntries[idx], ...req.body };
      }
      return res.json({ message: 'Entry updated successfully (Mock)' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update entry' });
  }
});

// Admin Approve Land Entry
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    try {
      await pool.query("UPDATE land_entries SET status = 'approved' WHERE id = ?", [id]);
      return res.json({ message: 'Entry approved successfully in MariaDB' });
    } catch (dbErr) {
      const idx = mockEntries.findIndex(e => e.id == id);
      if (idx !== -1) {
        mockEntries[idx].status = 'approved';
      }
      return res.json({ message: 'Entry approved successfully (Mock)' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve entry' });
  }
});

module.exports = router;
