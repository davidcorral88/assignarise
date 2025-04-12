
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
    
    // Add detailed logging to diagnose the issue
    console.log('Received holiday data:', { date, name, description });
    
    // Validate required fields
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Format the date correctly for the database
    const formattedDate = new Date(date).toISOString().split('T')[0];
    console.log('Formatted date:', formattedDate);
    
    const query = 'INSERT INTO holidays (date, name, description) VALUES ($1, $2, $3) RETURNING *';
    const values = [formattedDate, name, description || name]; // Use name as description if not provided
    
    console.log('Executing query with values:', values);
    
    const result = await pool.query(query, values);
    console.log('Insert result:', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding holiday:', error);
    console.error('Error details:', error.message);
    
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
    console.log('Deleting holiday with date:', date);
    
    // Try to parse the date to handle both ISO strings and date-only formats
    const formattedDate = new Date(date).toISOString().split('T')[0];
    console.log('Formatted date for deletion:', formattedDate);
    
    const query = 'DELETE FROM holidays WHERE date::date = $1::date RETURNING *';
    const result = await pool.query(query, [formattedDate]);
    
    console.log('Delete result:', result.rows);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    res.json({ message: 'Holiday deleted successfully', holiday: result.rows[0] });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a holiday
router.put('/:date', async (req, res) => {
  try {
    const oldDate = req.params.date;
    const { date, name, description } = req.body;
    
    console.log('Updating holiday:', { oldDate, newData: { date, name, description } });
    
    // Validate required fields
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Format dates
    const oldFormattedDate = new Date(oldDate).toISOString().split('T')[0];
    const newFormattedDate = new Date(date).toISOString().split('T')[0];
    
    console.log('Formatted dates:', { old: oldFormattedDate, new: newFormattedDate });
    
    // Begin a transaction
    await pool.query('BEGIN');
    
    // Delete the old holiday
    const deleteQuery = 'DELETE FROM holidays WHERE date::date = $1::date';
    const deleteResult = await pool.query(deleteQuery, [oldFormattedDate]);
    
    console.log('Delete result in update:', deleteResult);
    
    if (deleteResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    // Create a new holiday with the updated information
    const insertQuery = 'INSERT INTO holidays (date, name, description) VALUES ($1, $2, $3) RETURNING *';
    const insertValues = [newFormattedDate, name, description || name];
    const insertResult = await pool.query(insertQuery, insertValues);
    
    console.log('Insert result in update:', insertResult.rows[0]);
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.json(insertResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating holiday:', error);
    console.error('Error details:', error.message);
    
    // Check if it's a unique violation (holiday on that date already exists)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A holiday with this date already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
