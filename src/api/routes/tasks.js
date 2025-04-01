
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
    
    // Get task assignments
    const assignmentsResult = await pool.query('SELECT user_id, allocated_hours FROM task_assignments WHERE task_id = $1', [id]);
    
    const task = {
      ...result.rows[0],
      tags,
      assignments: assignmentsResult.rows
    };
    
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
    
    // Convert field names to snake_case for database compatibility
    // Insert task
    const taskResult = await client.query(
      `INSERT INTO tasks (id, title, description, status, created_by, created_at, 
        start_date, due_date, priority) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, title, description, status, createdBy, createdAt || new Date(), 
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
    
    // Insert assignments - handle both user_id and userId formats
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        const userId = assignment.userId || assignment.user_id;
        const hours = assignment.allocatedHours || assignment.allocated_hours;
        
        if (!userId) {
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
        // Handle both formats
        const userId = assignment.userId || assignment.user_id;
        const hours = assignment.allocatedHours || assignment.allocated_hours;
        
        if (!userId) {
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
