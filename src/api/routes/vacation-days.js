
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get vacation days
router.get('/', async (req, res) => {
  try {
    const { user_id, year } = req.query;
    
    let query = 'SELECT * FROM vacation_days';
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    
    if (year) {
      conditions.push(`EXTRACT(YEAR FROM date) = $${params.length + 1}`);
      params.push(year);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY date';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vacation days:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
