const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all transactions
router.get('/transactions', async (req, res) => {
  try {
    const { type, startDate, endDate, limit } = req.query;
    
    let query = 'SELECT * FROM finance WHERE 1=1';
    const params = [];

    // Filter by type
    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }

    // Filter by date range
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';

    // Limit results
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const [rows] = await db.query(query, params);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET single transaction
router.get('/transactions/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM finance WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { date, description, type, category, amount, notes } = req.body;

    // Validation
    if (!date || !description || !type || !category || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either income or expense'
      });
    }

    const [result] = await db.query(
      'INSERT INTO finance (date, description, type, category, amount, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [date, description, type, category, amount, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        id: result.insertId,
        date,
        description,
        type,
        category,
        amount,
        notes
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT update transaction
router.put('/transactions/:id', async (req, res) => {
  try {
    const { date, description, type, category, amount, notes } = req.body;
    const { id } = req.params;

    // Check if transaction exists
    const [existing] = await db.query('SELECT id FROM finance WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    const [result] = await db.query(
      'UPDATE finance SET date = ?, description = ?, type = ?, category = ?, amount = ?, notes = ? WHERE id = ?',
      [date, description, type, category, amount, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM finance WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET summary statistics
router.get('/summary', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let query = `
      SELECT 
        type,
        SUM(amount) as total
      FROM finance
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      query += ' AND YEAR(date) = ?';
      params.push(year);
    }
    if (month) {
      query += ' AND MONTH(date) = ?';
      params.push(month);
    }

    query += ' GROUP BY type';

    const [rows] = await db.query(query, params);

    const summary = {
      income: 0,
      expense: 0,
      balance: 0
    };

    rows.forEach(row => {
      if (row.type === 'income') {
        summary.income = parseFloat(row.total);
      } else if (row.type === 'expense') {
        summary.expense = parseFloat(row.total);
      }
    });

    summary.balance = summary.income - summary.expense;

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET monthly data for charts
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const [rows] = await db.query(`
      SELECT 
        MONTH(date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM finance
      WHERE YEAR(date) = ?
      GROUP BY MONTH(date)
      ORDER BY MONTH(date)
    `, [currentYear]);

    // Fill in missing months with 0
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map((name, index) => {
      const monthData = rows.find(r => r.month === index + 1);
      return {
        month: name,
        income: monthData ? parseFloat(monthData.income) : 0,
        expense: monthData ? parseFloat(monthData.expense) : 0
      };
    });

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET categories
router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM finance_categories WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    const [rows] = await db.query(query, params);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
