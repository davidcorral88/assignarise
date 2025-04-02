
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get next task ID
router.get('/next-id', async (req, res) => {
  try {
    console.log('Getting next task ID');
    const result = await pool.query('SELECT MAX(CAST(id AS INTEGER)) as max_id FROM tasks');
    console.log('Max ID result:', result.rows[0]);
    const nextId = result.rows[0].max_id ? parseInt(result.rows[0].max_id) + 1 : 1;
    console.log('Returning next task ID:', nextId);
    res.json({ nextId });
  } catch (error) {
    console.error('Error getting next task ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get task tags
    const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [id]);
    const tags = tagsResult.rows.map(row => row.tag);
    
    // Get task assignments - converting user_id to userId
    const assignmentsResult = await pool.query('SELECT user_id, allocated_hours FROM task_assignments WHERE task_id = $1', [id]);
    // Convert to camelCase and ensure user_id is a number
    const assignments = assignmentsResult.rows.map(row => ({
      userId: parseInt(row.user_id, 10),
      allocatedHours: parseFloat(row.allocated_hours)
    }));
    
    const task = {
      ...result.rows[0],
      tags,
      assignments
    };
    
    // Convert createdBy to a number if it exists
    if (task.created_by) {
      task.createdBy = parseInt(task.created_by, 10);
    }
    
    // Convert snake_case to camelCase for frontend compatibility
    if (task.created_at) task.createdAt = task.created_at;
    if (task.start_date) task.startDate = task.start_date;
    if (task.due_date) task.dueDate = task.due_date;
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      id, title, description, status, createdBy, createdAt, 
      startDate, dueDate, priority, tags, assignments 
    } = req.body;
    
    console.log('Received task data:', {
      id, title, status, createdBy, startDate, dueDate, 
      tags: tags?.length, 
      assignments: assignments?.length
    });
    
    // Ensure createdBy is an integer
    const createdByInt = typeof createdBy === 'string' ? parseInt(createdBy, 10) : createdBy;
    
    // Insert task - convert field names to snake_case for database
    const taskResult = await client.query(
      `INSERT INTO tasks (id, title, description, status, created_by, created_at, 
        start_date, due_date, priority) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, title, description, status, createdByInt, createdAt || new Date(), 
       startDate, dueDate, priority]
    );
    
    const task = taskResult.rows[0];
    
    // Insert tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          'INSERT INTO task_tags (task_id, tag) VALUES ($1, $2)',
          [task.id, tag]
        );
      }
    }
    
    // Insert assignments - handle numeric user IDs
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        // Extract userId, handle both formats and ensure it's a number
        const userIdInput = assignment.userId || assignment.user_id;
        const userId = typeof userIdInput === 'string' ? parseInt(userIdInput, 10) : userIdInput;
        
        // Extract allocatedHours, handle both formats
        const hours = assignment.allocatedHours || assignment.allocated_hours;
        
        if (userId === undefined || userId === null) {
          console.error('Missing user ID in assignment:', assignment);
          continue;
        }
        
        await client.query(
          'INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES ($1, $2, $3)',
          [task.id, userId, hours]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return complete task with tags and assignments
    task.tags = tags || [];
    task.assignments = assignments || [];
    
    // Convert some fields to camelCase for frontend
    if (task.created_by) task.createdBy = parseInt(task.created_by, 10);
    if (task.created_at) task.createdAt = task.created_at;
    if (task.start_date) task.startDate = task.start_date;
    if (task.due_date) task.dueDate = task.due_date;
    
    res.status(201).json(task);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
});

// Update task
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { 
      title, description, status, startDate, dueDate, 
      priority, category, project, tags, assignments 
    } = req.body;
    
    console.log('Updating task:', id, 'with data:', {
      title, status, startDate, dueDate, 
      tags: tags?.length, 
      assignments: assignments?.length
    });
    
    // Convert camelCase to snake_case for database
    const start_date = startDate;
    const due_date = dueDate;
    
    // Update task
    const taskResult = await client.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, 
       start_date = $4, due_date = $5, priority = $6, category = $7, project = $8
       WHERE id = $9 RETURNING *`,
      [title, description, status, start_date, due_date, priority, category, project, id]
    );
    
    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = taskResult.rows[0];
    
    // Update tags (delete and insert)
    await client.query('DELETE FROM task_tags WHERE task_id = $1', [id]);
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          'INSERT INTO task_tags (task_id, tag) VALUES ($1, $2)',
          [id, tag]
        );
      }
    }
    
    // Update assignments (delete and insert)
    await client.query('DELETE FROM task_assignments WHERE task_id = $1', [id]);
    
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        // Extract userId, handle both formats and ensure it's a number
        const userIdInput = assignment.userId || assignment.user_id;
        const userId = typeof userIdInput === 'string' ? parseInt(userIdInput, 10) : userIdInput;
        
        // Extract allocatedHours, handle both formats
        const hours = assignment.allocatedHours || assignment.allocated_hours;
        
        if (userId === undefined || userId === null) {
          console.error('Missing user ID in assignment:', assignment);
          continue;
        }
        
        await client.query(
          'INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES ($1, $2, $3)',
          [id, userId, hours]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return complete task with tags and assignments
    task.tags = tags || [];
    task.assignments = assignments || [];
    
    // Convert some fields to camelCase for frontend
    if (task.created_by) task.createdBy = parseInt(task.created_by, 10);
    if (task.created_at) task.createdAt = task.created_at;
    if (task.start_date) task.startDate = task.start_date;
    if (task.due_date) task.dueDate = task.due_date;
    
    console.log('Task updated successfully:', task);
    res.json(task);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
