
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
    const { date, name } = req.body;
    
    // Add detailed logging to diagnose the issue
    console.log('Received holiday data:', { date, name });
    
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
    
    // Updated query to only use name (no description column)
    const query = 'INSERT INTO holidays (date, name) VALUES ($1, $2) RETURNING *';
    const values = [formattedDate, name];
    
    console.log('Executing query with values:', values);
    
    const result = await pool.query(query, values);
    console.log('Insert result:', result.rows[0]);
    
    // Log the date as stored in the database for debugging
    console.log('Date as stored in DB:', result.rows[0].date);
    console.log('Date without timezone adjustment:', new Date(result.rows[0].date).toISOString().split('T')[0]);
    
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
    
    // Make sure date is properly formatted for PostgreSQL
    let formattedDate;
    try {
      // Handle various date formats
      formattedDate = new Date(date).toISOString().split('T')[0];
      console.log('Formatted date for deletion:', formattedDate);
    } catch (error) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // First, verify if holiday exists with this date
    console.log('Checking if holiday exists with date:', formattedDate);
    
    // Method 1: Direct date comparison
    const directQuery = "SELECT * FROM holidays WHERE date::date = $1::date";
    let result = await pool.query(directQuery, [formattedDate]);
    console.log('Holiday check result:', result.rows);
    
    // Method 2: Text format comparison if first method doesn't work
    if (result.rowCount === 0) {
      const textQuery = "SELECT * FROM holidays WHERE TO_CHAR(date, 'YYYY-MM-DD') = $1";
      result = await pool.query(textQuery, [formattedDate]);
      console.log('Text format query result:', result.rows);
    }
    
    // Method 3: Try with date +/- 1 day to account for timezone issues
    if (result.rowCount === 0) {
      // Try with tomorrow's date
      const nextDate = new Date(formattedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      
      const nextDayQuery = "SELECT * FROM holidays WHERE date::date = $1::date";
      result = await pool.query(nextDayQuery, [nextDateStr]);
      console.log('Next day query result:', result.rows);
      
      if (result.rowCount === 0) {
        // Try with yesterday's date
        const prevDate = new Date(formattedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        
        const prevDayQuery = "SELECT * FROM holidays WHERE date::date = $1::date";
        result = await pool.query(prevDayQuery, [prevDateStr]);
        console.log('Previous day query result:', result.rows);
      }
    }
    
    // Get all holidays for debugging
    const allHolidays = await pool.query('SELECT * FROM holidays');
    console.log('Debug query result:', allHolidays.rows);
    
    if (result.rowCount === 0) {
      console.log('No holiday found for date:', formattedDate);
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    // Use the found holiday for deletion
    const holidayToDelete = result.rows[0];
    console.log('Holiday found for deletion:', holidayToDelete);
    
    // Delete using the date from the database record as it is the primary key
    // NOT using id as it doesn't exist in the table
    const deleteQuery = 'DELETE FROM holidays WHERE date = $1 RETURNING *';
    const deleteResult = await pool.query(deleteQuery, [holidayToDelete.date]);
    
    console.log('Delete result:', deleteResult.rows);
    
    res.json({ message: 'Holiday deleted successfully', holiday: deleteResult.rows[0] });
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
    const { date, name } = req.body;
    
    console.log('Updating holiday:', { oldDate, newData: { date, name } });
    
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
    
    // Use the same improved query format for checking
    const checkQuery = 'SELECT * FROM holidays WHERE date::date = $1::date';
    const checkResult = await pool.query(checkQuery, [oldFormattedDate]);
    console.log('Holiday check result:', checkResult.rows);
    
    if (checkResult.rowCount === 0) {
      console.log('No holiday found for date:', oldFormattedDate);
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    // Begin a transaction
    await pool.query('BEGIN');
    
    // Delete the old holiday
    const deleteQuery = 'DELETE FROM holidays WHERE date = $1';
    const deleteResult = await pool.query(deleteQuery, [checkResult.rows[0].date]);
    
    console.log('Delete result in update:', deleteResult);
    
    if (deleteResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    // Create a new holiday with the updated information (no description)
    const insertQuery = 'INSERT INTO holidays (date, name) VALUES ($1, $2) RETURNING *';
    const insertValues = [newFormattedDate, name];
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
