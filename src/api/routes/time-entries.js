
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
      params.push(parseInt(task_id, 10)); // Ensure task_id is an integer
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
    const { task_id, user_id, hours, date, notes, category, project, activity, time_format } = req.body;
    
    console.log('Received time entry data:', req.body);
    
    // Get next ID
    const nextIdResult = await pool.query('SELECT MAX(id) as max_id FROM time_entries');
    const nextId = nextIdResult.rows[0].max_id ? parseInt(nextIdResult.rows[0].max_id) + 1 : 1;
    
    // Ensure user_id and task_id are integers
    const userIdInt = parseInt(user_id, 10);
    const taskIdInt = parseInt(task_id, 10);
    
    if (isNaN(userIdInt) || isNaN(taskIdInt)) {
      console.error('Invalid user_id or task_id:', { user_id, task_id });
      return res.status(400).json({ error: 'Invalid user_id or task_id' });
    }
    
    console.log('Creating time entry:', { id: nextId, task_id: taskIdInt, user_id: userIdInt, hours, date });
    
    const result = await pool.query(
      `INSERT INTO time_entries (id, task_id, user_id, hours, date, notes, category, project, activity, time_format) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [nextId, taskIdInt, userIdInt, hours, date, notes, category, project, activity, time_format]
    );
    
    console.log('Time entry created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update time entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task_id, user_id, hours, date, notes, category, project, activity, time_format } = req.body;
    
    // Ensure IDs are integers
    const entryIdInt = parseInt(id, 10);
    const userIdInt = parseInt(user_id, 10);
    const taskIdInt = parseInt(task_id, 10);
    
    if (isNaN(entryIdInt) || isNaN(userIdInt) || isNaN(taskIdInt)) {
      return res.status(400).json({ error: 'Invalid ID values' });
    }
    
    console.log('Updating time entry:', { id: entryIdInt, task_id: taskIdInt, user_id: userIdInt });
    
    const result = await pool.query(
      `UPDATE time_entries SET 
        task_id = $1, user_id = $2, hours = $3, date = $4, 
        notes = $5, category = $6, project = $7, activity = $8, time_format = $9
       WHERE id = $10 RETURNING *`,
      [taskIdInt, userIdInt, hours, date, notes, category, project, activity, time_format, entryIdInt]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    console.log('Time entry updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete time entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure id is an integer
    const entryIdInt = parseInt(id, 10);
    
    if (isNaN(entryIdInt)) {
      return res.status(400).json({ error: 'Invalid time entry ID' });
    }
    
    console.log('Deleting time entry:', entryIdInt);
    
    const result = await pool.query('DELETE FROM time_entries WHERE id = $1 RETURNING *', [entryIdInt]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    console.log('Time entry deleted successfully');
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
