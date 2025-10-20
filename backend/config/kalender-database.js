const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// UPDATED: Sekarang menggunakan database gereja_db yang sama
// untuk semua tabel (users, finance, events)
const kalenderPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gereja_db', // CHANGED: Gunakan DB yang sama
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi
kalenderPool.getConnection()
  .then(connection => {
    console.log('✅ Connected to gereja_db database (for events/calendar)');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to database (events):', err.message);
  });

module.exports = kalenderPool;
