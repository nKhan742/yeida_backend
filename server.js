const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { checkConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const entryRoutes = require('./routes/entries');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entries', entryRoutes);

app.get('/api/health', async (req, res) => {
  const dbConnected = await checkConnection();
  res.json({
    status: 'online',
    system: 'Yamuna Expressway Industrial Development Authority (YEIDA) API',
    mariadbConnected: dbConnected,
    timestamp: new Date()
  });
});

app.listen(PORT, async () => {
  console.log(`YEIDA API Server running on port ${PORT}`);
  await checkConnection();
});
