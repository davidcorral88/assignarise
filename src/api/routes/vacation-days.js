
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

// Add a vacation day
router.post('/', async (req, res) => {
  try {
    const { userId, date, type } = req.body;
    
    // Validate required fields
    if (!userId || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields: userId, date, and type are mandatory' });
    }
    
    // Insert the vacation day
    const query = 'INSERT INTO vacation_days (user_id, date, type) VALUES ($1, $2, $3) RETURNING *';
    const values = [userId, date, type];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding vacation day:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A vacation day already exists for this user on this date' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a vacation day
router.delete('/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    
    // Validate that userId is provided and is a valid number
    const userIdNum = Number(userId);
    if (!userId || isNaN(userIdNum)) {
      return res.status(400).json({ error: `Invalid user ID: ${userId}` });
    }
    
    // Validate that date is provided and is in a valid format
    if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: `Invalid date format: ${date}. Expected format: YYYY-MM-DD` });
    }
    
    console.log(`Attempting to delete vacation day for user ${userIdNum} on date ${date}`);
    
    const query = 'DELETE FROM vacation_days WHERE user_id = $1 AND date = $2 RETURNING *';
    const values = [userIdNum, date];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vacation day not found' });
    }
    
    res.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting vacation day:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
