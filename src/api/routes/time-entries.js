
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
    
    // Normalize time entries to ensure consistent types
    const normalizedEntries = result.rows.map(entry => ({
      ...entry,
      id: parseInt(entry.id, 10),
      task_id: parseInt(entry.task_id, 10),
      user_id: parseInt(entry.user_id, 10),
      hours: parseFloat(entry.hours)
    }));
    
    res.json(normalizedEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get time entries by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure userId is an integer
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('Fetching time entries for user ID:', userIdInt);
    
    const query = 'SELECT * FROM time_entries WHERE user_id = $1 ORDER BY date DESC';
    const result = await pool.query(query, [userIdInt]);
    
    console.log(`Retrieved ${result.rows.length} time entries for user ID ${userIdInt}`);
    
    // Normalize time entries to ensure consistent types
    const normalizedEntries = result.rows.map(entry => ({
      ...entry,
      id: parseInt(entry.id, 10),
      task_id: parseInt(entry.task_id, 10),
      user_id: parseInt(entry.user_id, 10),
      hours: parseFloat(entry.hours)
    }));
    
    res.json(normalizedEntries);
  } catch (error) {
    console.error(`Error fetching time entries for user ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get time entries by task ID
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Ensure taskId is an integer
    const taskIdInt = parseInt(taskId, 10);
    
    if (isNaN(taskIdInt)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    console.log('Fetching time entries for task ID:', taskIdInt);
    
    const query = 'SELECT * FROM time_entries WHERE task_id = $1 ORDER BY date DESC';
    const result = await pool.query(query, [taskIdInt]);
    
    console.log(`Retrieved ${result.rows.length} time entries for task ID ${taskIdInt}`);
    
    // Normalize time entries to ensure consistent types
    const normalizedEntries = result.rows.map(entry => ({
      ...entry,
      id: parseInt(entry.id, 10),
      task_id: parseInt(entry.task_id, 10),
      user_id: parseInt(entry.user_id, 10),
      hours: parseFloat(entry.hours)
    }));
    
    res.json(normalizedEntries);
  } catch (error) {
    console.error(`Error fetching time entries for task ${req.params.taskId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create time entry
router.post('/', async (req, res) => {
  try {
    const { task_id, user_id, hours, date, notes, category, project, activity, time_format, timeFormat } = req.body;
    
    console.log('Received time entry data:', JSON.stringify(req.body));
    
    // Validate input data
    if (!task_id || !user_id || !hours || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        received: { task_id, user_id, hours, date } 
      });
    }
    
    // Convert IDs to integers
    const userIdInt = typeof user_id === 'string' ? parseInt(user_id, 10) : user_id;
    const taskIdInt = typeof task_id === 'string' ? parseInt(task_id, 10) : task_id;
    
    if (isNaN(userIdInt) || isNaN(taskIdInt)) {
      console.error('Invalid user_id or task_id:', { user_id, task_id });
      return res.status(400).json({ 
        error: 'Invalid user_id or task_id',
        received: { user_id, task_id }
      });
    }
    
    // Ensure hours is a number
    const hoursNumber = parseFloat(hours);
    if (isNaN(hoursNumber)) {
      return res.status(400).json({ 
        error: 'Invalid hours value',
        received: { hours }
      });
    }
    
    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format. Expected YYYY-MM-DD',
        received: { date }
      });
    }
    
    // Get next ID
    const nextIdResult = await pool.query('SELECT MAX(id) as max_id FROM time_entries');
    const nextId = nextIdResult.rows[0].max_id ? parseInt(nextIdResult.rows[0].max_id) + 1 : 1;
    
    console.log('Creating time entry:', { id: nextId, task_id: taskIdInt, user_id: userIdInt, hours: hoursNumber, date });
    
    // Use timeFormat if provided, otherwise use time_format (for compatibility)
    const finalTimeFormat = timeFormat || time_format || null;
    
    try {
      const result = await pool.query(
        `INSERT INTO time_entries (id, task_id, user_id, hours, date, notes, category, project, activity, time_format) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [nextId, taskIdInt, userIdInt, hoursNumber, date, notes || null, category || null, project || null, activity || null, finalTimeFormat]
      );
      
      // Normalize response data types
      const entry = {
        ...result.rows[0],
        id: parseInt(result.rows[0].id, 10),
        task_id: parseInt(result.rows[0].task_id, 10),
        user_id: parseInt(result.rows[0].user_id, 10),
        hours: parseFloat(result.rows[0].hours),
        timeFormat: result.rows[0].time_format // Return the timeFormat in the response
      };
      
      console.log('Time entry created:', entry);
      res.status(201).json(entry);
    } catch (dbError) {
      console.error('Database error creating time entry:', dbError);
      
      // Check if it's a foreign key constraint error
      if (dbError.code === '23503') { // Foreign key violation
        return res.status(400).json({ 
          error: 'Invalid task_id or user_id. The specified task or user does not exist.',
          details: dbError.detail 
        });
      }
      
      throw dbError; // Re-throw for the outer catch
    }
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update time entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task_id, user_id, hours, date, notes, category, project, activity, time_format, timeFormat } = req.body;
    
    // Ensure IDs are integers
    const entryIdInt = parseInt(id, 10);
    const userIdInt = typeof user_id === 'string' ? parseInt(user_id, 10) : user_id;
    const taskIdInt = typeof task_id === 'string' ? parseInt(task_id, 10) : task_id;
    
    if (isNaN(entryIdInt) || isNaN(userIdInt) || isNaN(taskIdInt)) {
      return res.status(400).json({ error: 'Invalid ID values' });
    }
    
    // Use timeFormat if provided, otherwise use time_format (for compatibility)
    const finalTimeFormat = timeFormat || time_format || null;
    
    console.log('Updating time entry:', { id: entryIdInt, task_id: taskIdInt, user_id: userIdInt });
    
    const result = await pool.query(
      `UPDATE time_entries SET 
        task_id = $1, user_id = $2, hours = $3, date = $4, 
        notes = $5, category = $6, project = $7, activity = $8, time_format = $9
       WHERE id = $10 RETURNING *`,
      [taskIdInt, userIdInt, hours, date, notes, category, project, activity, finalTimeFormat, entryIdInt]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    // Normalize response data types
    const entry = {
      ...result.rows[0],
      id: parseInt(result.rows[0].id, 10),
      task_id: parseInt(result.rows[0].task_id, 10),
      user_id: parseInt(result.rows[0].user_id, 10),
      hours: parseFloat(result.rows[0].hours),
      timeFormat: result.rows[0].time_format // Return the timeFormat in the response
    };
    
    console.log('Time entry updated:', entry);
    res.json(entry);
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
