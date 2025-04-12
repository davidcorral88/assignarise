
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get holidays
router.get('/', async (req, res) => {
  try {
    const { year } = req.query;
    
    let query = 'SELECT * FROM holidays';
    const params = [];
    
    if (year) {
      query += ' WHERE EXTRACT(YEAR FROM date) = $1';
      params.push(year);
    }
    
    query += ' ORDER BY date';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new holiday
router.post('/', async (req, res) => {
  try {
    const { date, name, description } = req.body;
    
    // Validate required fields
    if (!date || !name) {
      return res.status(400).json({ error: 'Date and name are required' });
    }
    
    const query = 'INSERT INTO holidays (date, name, description) VALUES ($1, $2, $3) RETURNING *';
    const values = [date, name, description || name]; // Use name as description if not provided
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding holiday:', error);
    
    // Check if it's a unique violation (holiday on that date already exists)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A holiday with this date already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a holiday
router.delete('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Try to parse the date to handle both ISO strings and date-only formats
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const query = 'DELETE FROM holidays WHERE date::date = $1::date RETURNING *';
    const result = await pool.query(query, [formattedDate]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    res.json({ message: 'Holiday deleted successfully', holiday: result.rows[0] });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a holiday
router.put('/:date', async (req, res) => {
  try {
    const oldDate = req.params.date;
    const { date, name, description } = req.body;
    
    // Validate required fields
    if (!date || !name) {
      return res.status(400).json({ error: 'Date and name are required' });
    }
    
    // Format dates
    const oldFormattedDate = new Date(oldDate).toISOString().split('T')[0];
    const newFormattedDate = new Date(date).toISOString().split('T')[0];
    
    // Begin a transaction
    await pool.query('BEGIN');
    
    // Delete the old holiday
    const deleteQuery = 'DELETE FROM holidays WHERE date::date = $1::date';
    const deleteResult = await pool.query(deleteQuery, [oldFormattedDate]);
    
    if (deleteResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    // Create a new holiday with the updated information
    const insertQuery = 'INSERT INTO holidays (date, name, description) VALUES ($1, $2, $3) RETURNING *';
    const insertValues = [newFormattedDate, name, description || name];
    const insertResult = await pool.query(insertQuery, insertValues);
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.json(insertResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating holiday:', error);
    
    // Check if it's a unique violation (holiday on that date already exists)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A holiday with this date already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
