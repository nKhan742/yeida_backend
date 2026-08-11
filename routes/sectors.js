const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// List of all Sectors and Villages mapping
const SECTOR_VILLAGE_DATA = [
  { sector: 'Sector 5', village: 'Harola (हरौला)' },
  { sector: 'Sector 11', village: 'Jhundpura (झुंडपुरा)' },
  { sector: 'Sector 15', village: 'Naya Bans (नया बाँस)' },
  { sector: 'Sector 22', village: 'Chora Sadatpur & Ragunathpur (चोरा सादतपुर /रघुनाथपुर)' },
  { sector: 'Sector 27', village: 'Atta (अट्टा गांव)' },
  { sector: 'Sector 31', village: 'Nithari (निठारी)' },
  { sector: 'Sector 35', village: 'Morna (मोरना)' },
  { sector: 'Sector 41', village: 'Agahapur (अगहापुर)' },
  { sector: 'Sector 44', village: 'Chhalera Banger (छलेरा बांगर)' },
  { sector: 'Sector 45', village: 'Sadarpur (सदरपुर)' },
  { sector: 'Sector 46', village: 'Sarai Sadar (सराय सदर)' },
  { sector: 'Sector 49', village: 'Baraula (बरौला)' },
  { sector: 'Sector 51', village: 'Hoshiarpur (होशियारपुर)' },
  { sector: 'Sector 53', village: 'Gijhaur (घिझोड)' },
  { sector: 'Sector 56', village: 'Khora (खोड़ा मकनपुर)' },
  { sector: 'Sector 58', village: 'Bishanpura (बिशनपुरा)' },
  { sector: 'Sector 62', village: 'Rasulpur Nawada (रसूलपुर नवादा)' },
  { sector: 'Sector 63', village: 'Chhajarsi (छाजारसी)' },
  { sector: 'Sector 66', village: 'Mamura (मामूरा)' },
  { sector: 'Sector 68', village: 'Garhi Chaukhandi (गढ़ी चौखंडी)' },
  { sector: 'Sector 70', village: 'Basai (बसई गांव)' },
  { sector: 'Sector 72', village: 'Sharfabad (शरफाबाद)' },
  { sector: 'Sector 80', village: 'Kakrola (ककरोला)' },
  { sector: 'Sector 85', village: 'Yaqubpur (याकूबपुर)' },
  { sector: 'Sector 86', village: 'Allhabans (इल्हाबाँस)' },
  { sector: 'Sector 87', village: 'Sikandarpur (सिकंदरपुर)' },
  { sector: 'Sector 93', village: 'Gejah Tallutabad (गेजा ताल्लुताबाद)' },
  { sector: 'Sector 102', village: 'Salarpur (सलारपुर)' },
  { sector: 'Sector 104', village: 'Hazipur (हाजीपुर)' },
  { sector: 'Sector 110', village: 'Bhangel Begampur (भंगेल बेगमपुर)' },
  { sector: 'Sector 115', village: 'Sorakha (सोरखा)' },
  { sector: 'Sector 122', village: 'Parthala Khanjarpur (पर्थला खंजरपुर)' },
  { sector: 'Sector 126', village: 'Raipur Khadar (राइपुर खादर)' },
  { sector: 'Sector 127', village: 'Bakhtawarpur (बख्तावरपुर)' },
  { sector: 'Sector 128', village: 'Shahpur Govardhanpur & Sultanpur (शाहपुर गोवर्धनपुर & सुल्तानपुर)' },
  { sector: 'Sector 130', village: 'Bajidpur (बाजिदपुर)' },
  { sector: 'Sector 131', village: 'Asagarpur (असगरपुर)' },
  { sector: 'Sector 132', village: 'Rohilapur (रोहिलपुर)' },
  { sector: 'Sector 133', village: 'Nagali Sakpur (नगली सकपुर)' },
  { sector: 'Sector 134', village: 'Harpal ki nagali' },
  { sector: 'Sector 141', village: 'Shahdara (शाहदरा)' },
  { sector: 'Sector 145', village: 'Nalgadha (नालागढ़)' },
  { sector: 'Sector 148', village: 'Nalgadha (नालागढ़)' },
  { sector: 'Sector 149', village: 'Kondli (कोंडली)' },
  { sector: 'Sector 150', village: 'Garhi samastpur (गढ़ी समस्तपुर)' },
  { sector: 'Sector 151', village: 'Dalerpur (दलेरपुर)' },
  { sector: 'Sector 152', village: 'Kambakashpur (कम्बक्ष्पूर)' },
  { sector: 'Sector 154', village: 'Badauli (बड़ौली)' },
  { sector: 'Sector 159', village: 'Jhatta (झट्टा)' },
  { sector: 'Sector 162', village: 'Gulavali (गुलावली)' },
  { sector: 'Sector 163', village: 'Mohiyapur (मोहियापुर)' },
  { sector: 'Sector 165', village: 'Dalupura (दलूपुरा)' },
  { sector: 'Sector 167', village: 'Chhaprauli Bangar (छपरौली बांगर)' },
  { sector: 'Sector 168', village: 'Dostpur Mangroli (दोस्तपुर मंगरोली)' }
];

// Helper: Seed sector_villages table in DB if not present
async function ensureSectorVillagesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sector_villages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sector VARCHAR(100) NOT NULL,
        village VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await pool.query('SELECT COUNT(*) as count FROM sector_villages');
    if (rows[0].count === 0) {
      for (const item of SECTOR_VILLAGE_DATA) {
        await pool.query('INSERT INTO sector_villages (sector, village) VALUES (?, ?)', [item.sector, item.village]);
      }
    }
  } catch (err) {
    console.error('Sector Villages table setup error:', err.message);
  }
}
ensureSectorVillagesTable();

// GET /api/sectors - Fetch unique sectors list
router.get('/', async (req, res) => {
  try {
    try {
      const [rows] = await pool.query('SELECT DISTINCT sector FROM sector_villages ORDER BY CAST(REGEXP_SUBSTR(sector, "[0-9]+") AS UNSIGNED) ASC');
      if (rows.length > 0) {
        return res.json(rows.map(r => r.sector));
      }
    } catch (err) {
      // Fallback
    }

    const uniqueSectors = Array.from(new Set(SECTOR_VILLAGE_DATA.map(item => item.sector)));
    return res.json(uniqueSectors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sectors' });
  }
});

// GET /api/sectors/mapping - Fetch full mapping (sector -> villages array)
router.get('/mapping', async (req, res) => {
  try {
    let rawData = SECTOR_VILLAGE_DATA;
    try {
      const [rows] = await pool.query('SELECT sector, village FROM sector_villages');
      if (rows.length > 0) {
        rawData = rows;
      }
    } catch (err) {
      // Fallback to memory
    }

    const mapping = {};
    rawData.forEach(item => {
      if (!mapping[item.sector]) {
        mapping[item.sector] = [];
      }
      if (!mapping[item.sector].includes(item.village)) {
        mapping[item.sector].push(item.village);
      }
    });

    return res.json(mapping);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sector village mapping' });
  }
});

// GET /api/sectors/:sectorName/villages - Fetch villages for specific sector
router.get('/:sectorName/villages', async (req, res) => {
  const { sectorName } = req.params;
  try {
    try {
      const [rows] = await pool.query('SELECT village FROM sector_villages WHERE LOWER(sector) = LOWER(?)', [sectorName]);
      if (rows.length > 0) {
        return res.json(rows.map(r => r.village));
      }
    } catch (err) {
      // Fallback
    }

    const filtered = SECTOR_VILLAGE_DATA.filter(item => item.sector.toLowerCase() === sectorName.toLowerCase()).map(item => item.village);
    return res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch villages for sector' });
  }
});

module.exports = router;
