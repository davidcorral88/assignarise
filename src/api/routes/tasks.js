
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tasks by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Asegurarse de que userId é un enteiro
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(userIdInt)) {
      console.error(`Invalid user ID: ${userId}`);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log(`Fetching tasks for user ID: ${userIdInt}`);
    
    // Query para obter tarefas asignadas ao usuario
    const query = `
      SELECT t.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'task_id', ta.task_id,
              'user_id', ta.user_id,
              'allocated_hours', ta.allocated_hours
            )
          ) FILTER (WHERE ta.task_id IS NOT NULL), '[]'
        ) AS assignments
      FROM tasks t
      INNER JOIN task_assignments ta ON t.id = ta.task_id
      WHERE ta.user_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    
    const result = await pool.query(query, [userIdInt]);
    console.log(`Found ${result.rows.length} tasks for user ID ${userIdInt}`);
    
    // Se non se atopan tarefas, devolve un array baleiro en lugar de 404
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching tasks for user ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tasks with task_assignments
router.get('/conassignments/', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'task_id', ta.task_id,
              'user_id', ta.user_id,
              'allocated_hours', ta.allocated_hours
            )
          ) FILTER (WHERE ta.task_id IS NOT NULL), '[]'
        ) AS assignments
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks with assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get next task ID
router.get('/next-id', async (req, res) => {
  try {
    console.log('Getting next task ID');
    const result = await pool.query('SELECT MAX(id) as max_id FROM tasks');
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
    const taskId = parseInt(id, 10);
    
    if (isNaN(taskId)) {
      console.error(`Invalid task ID: ${id}`);
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get task tags
    const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [taskId]);
    const tags = tagsResult.rows.map(row => row.tag);
    
    // Get task assignments
    const assignmentsResult = await pool.query(
      'SELECT user_id, allocated_hours FROM task_assignments WHERE task_id = $1', 
      [taskId]
    );
    
    const assignments = assignmentsResult.rows.map(row => ({
      userId: parseInt(row.user_id, 10),
      allocatedHours: parseFloat(row.allocated_hours)
    }));
    
    const task = {
      ...result.rows[0],
      tags,
      assignments,
      // Convert fields for frontend compatibility
      createdBy: parseInt(result.rows[0].created_by, 10),
      createdAt: result.rows[0].created_at,
      startDate: result.rows[0].start_date,
      dueDate: result.rows[0].due_date
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
      title, description, status, createdBy, createdAt, 
      startDate, dueDate, priority, tags, assignments,
      category, project 
    } = req.body;
    
    // Get the next ID from the database
    const nextIdResult = await client.query('SELECT MAX(id) as max_id FROM tasks');
    const nextId = nextIdResult.rows[0].max_id ? parseInt(nextIdResult.rows[0].max_id) + 1 : 1;
    
    console.log('Received task data:', {
      title, status, createdBy, startDate, dueDate, 
      tags: tags?.length, 
      assignments: assignments?.length
    });
    console.log('Generated task ID:', nextId);
    
    // Ensure createdBy is an integer
    const createdByInt = typeof createdBy === 'string' ? parseInt(createdBy, 10) : createdBy;
    
    // Insert task with numeric ID
    const taskResult = await client.query(
      `INSERT INTO tasks (id, title, description, status, created_by, created_at, 
        start_date, due_date, priority, category, project) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [nextId, title, description, status, createdByInt, createdAt || new Date(), 
       startDate, dueDate, priority, category, project]
    );
    
    const task = taskResult.rows[0];
    
    // Insert tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          'INSERT INTO task_tags (task_id, tag) VALUES ($1, $2)',
          [nextId, tag]
        );
      }
    }
    
    // Insert assignments
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        // Extract user_id and ensure it's a number
        const userIdInput = assignment.user_id || assignment.userId;
        const userId = typeof userIdInput === 'string' ? parseInt(userIdInput, 10) : userIdInput;
        
        // Extract allocatedHours
        const hours = assignment.allocatedHours || assignment.allocated_hours;
        
        if (userId === undefined || userId === null) {
          console.error('Missing user ID in assignment:', assignment);
          continue;
        }
        
        console.log(`Inserting assignment for task ${nextId}, user ${userId}, hours ${hours}`);
        
        await client.query(
          'INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES ($1, $2, $3)',
          [nextId, userId, hours]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return complete task with tags and assignments
    task.tags = tags || [];
    task.assignments = assignments || [];
    
    // Convert fields for frontend
    task.createdBy = parseInt(task.created_by, 10);
    task.createdAt = task.created_at;
    task.startDate = task.start_date;
    task.dueDate = task.due_date;
    
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
    const taskId = parseInt(id, 10);
    
    if (isNaN(taskId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    const { 
      title, description, status, startDate, dueDate, 
      priority, category, project, tags, assignments 
    } = req.body;
    
    console.log('Updating task:', taskId, 'with data:', {
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
      [title, description, status, start_date, due_date, priority, category, project, taskId]
    );
    
    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = taskResult.rows[0];
    
    // Update tags (delete and insert)
    await client.query('DELETE FROM task_tags WHERE task_id = $1', [taskId]);
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          'INSERT INTO task_tags (task_id, tag) VALUES ($1, $2)',
          [taskId, tag]
        );
      }
    }
    
    // Update assignments (delete and insert)
    await client.query('DELETE FROM task_assignments WHERE task_id = $1', [taskId]);
    
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        // Extract userId and ensure it's a number
        const userIdInput = assignment.userId || assignment.user_id;
        const userId = typeof userIdInput === 'string' ? parseInt(userIdInput, 10) : userIdInput;
        
        // Extract allocatedHours
        const hours = assignment.allocatedHours || assignment.allocated_hours;
        
        if (userId === undefined || userId === null) {
          console.error('Missing user ID in assignment:', assignment);
          continue;
        }
        
        await client.query(
          'INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES ($1, $2, $3)',
          [taskId, userId, hours]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return complete task with tags and assignments
    task.tags = tags || [];
    task.assignments = assignments || [];
    
    // Convert fields for frontend
    task.createdBy = parseInt(task.created_by, 10);
    task.createdAt = task.created_at;
    task.startDate = task.start_date;
    task.dueDate = task.due_date;
    
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
    const taskId = parseInt(id, 10);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
    
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
