
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get time entries
router.get('/', async (req, res) => {
  try {
    const { user_id, task_id, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM time_entries';
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(parseInt(user_id, 10)); // Ensure user_id is an integer
    }
    
    if (task_id) {
      conditions.push(`task_id = $${params.length + 1}`);
      params.push(task_id);
    }
    
    if (start_date) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(start_date);
    }
    
    if (end_date) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(end_date);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY date DESC';
    
    console.log('Time entries query:', query, params);
    const result = await pool.query(query, params);
    console.log(`Retrieved ${result.rows.length} time entries`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create time entry
router.post('/', async (req, res) => {
  try {
    const { id, task_id, user_id, hours, date, notes, category, project, activity, time_format } = req.body;
    
    // Ensure user_id is an integer
    const userIdInt = parseInt(user_id, 10);
    
    console.log('Creating time entry:', { id, task_id, user_id: userIdInt, hours, date });
    
    const result = await pool.query(
      `INSERT INTO time_entries (id, task_id, user_id, hours, date, notes, category, project, activity, time_format) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, task_id, userIdInt, hours, date, notes, category, project, activity, time_format]
    );
    
    console.log('Time entry created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
