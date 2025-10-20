const express = require('express');
const router = express.Router();
const kalenderPool = require('../config/kalender-database');

// GET all events
router.get('/events', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let query = 'SELECT * FROM jadwal_kegiatan';
    let params = [];
    
    if (year && month) {
      query += ' WHERE YEAR(waktu_mulai) = ? AND MONTH(waktu_mulai) = ?';
      params = [year, month];
    } else if (year) {
      query += ' WHERE YEAR(waktu_mulai) = ?';
      params = [year];
    }
    
    query += ' ORDER BY waktu_mulai ASC';
    
    const [rows] = await kalenderPool.execute(query, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// GET single event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await kalenderPool.execute(
      'SELECT * FROM jadwal_kegiatan WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      message: error.message
    });
  }
});

// GET events by date range
router.get('/events/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;
    
    const [rows] = await kalenderPool.execute(
      'SELECT * FROM jadwal_kegiatan WHERE waktu_mulai >= ? AND waktu_mulai <= ? ORDER BY waktu_mulai ASC',
      [start, end]
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching events by range:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// GET events by kategori
router.get('/events/kategori/:kategori', async (req, res) => {
  try {
    const { kategori } = req.params;
    
    const [rows] = await kalenderPool.execute(
      'SELECT * FROM jadwal_kegiatan WHERE kategori = ? ORDER BY waktu_mulai ASC',
      [kategori]
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching events by kategori:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// POST create new event
router.post('/events', async (req, res) => {
  try {
    const {
      nama_kegiatan,
      deskripsi,
      kategori,
      waktu_mulai,
      waktu_selesai,
      lokasi,
      penanggung_jawab,
      kontak
    } = req.body;
    
    // Validasi required fields
    if (!nama_kegiatan || !kategori || !waktu_mulai) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['nama_kegiatan', 'kategori', 'waktu_mulai']
      });
    }
    
    const [result] = await kalenderPool.execute(
      `INSERT INTO jadwal_kegiatan 
       (nama_kegiatan, deskripsi, kategori, waktu_mulai, waktu_selesai, lokasi, penanggung_jawab, kontak) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_kegiatan, deskripsi, kategori, waktu_mulai, waktu_selesai, lokasi || 'Gereja Utama', penanggung_jawab, kontak]
    );
    
    // Get the created event
    const [newEvent] = await kalenderPool.execute(
      'SELECT * FROM jadwal_kegiatan WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
      message: error.message
    });
  }
});

// PUT update event
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_kegiatan,
      deskripsi,
      kategori,
      waktu_mulai,
      waktu_selesai,
      lokasi,
      penanggung_jawab,
      kontak
    } = req.body;
    
    // Check if event exists
    const [existing] = await kalenderPool.execute(
      'SELECT * FROM jadwal_kegiatan WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    await kalenderPool.execute(
      `UPDATE jadwal_kegiatan 
        SET nama_kegiatan = ?, deskripsi = ?, kategori = ?, waktu_mulai = ?, 
            waktu_selesai = ?, lokasi = ?, penanggung_jawab = ?, kontak = ?
        WHERE id = ?`,
      [nama_kegiatan, deskripsi, kategori, waktu_mulai, waktu_selesai, lokasi, penanggung_jawab, kontak, id]
    );
    
    // Get updated event
    const [updated] = await kalenderPool.execute(
      'SELECT * FROM jadwal_kegiatan WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
      message: error.message
    });
  }
});

// DELETE event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const [existing] = await kalenderPool.execute(
      'SELECT * FROM jadwal_kegiatan WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    await kalenderPool.execute(
      'DELETE FROM jadwal_kegiatan WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      message: error.message
    });
  }
});

// GET available categories
router.get('/categories', async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        'Misa & Liturgi',
        'Kegiatan Komunitas',
        'Doa & Devosi',
        'Pastoral & Acara Khusus'
      ]
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
