const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../utils/auth');
const { sendEmail } = require('../utils/emailService');

// Route to create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, priority, createdBy, startDate, dueDate, tags, assignments, attachments, category, project } = req.body;

    const query = `
      INSERT INTO tasks (title, description, status, priority, createdBy, startDate, dueDate, tags, assignments, attachments, category, project)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [title, description, status, priority, createdBy, startDate, dueDate, tags, assignments, attachments, category, project];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
});

// Route to get all tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `SELECT * FROM tasks`;
    const values = [];

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      query += ` WHERE createdBy = $1`;
      values.push(req.user.id);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// Route to get a specific task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM tasks WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
});

// Route to update a task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, startDate, dueDate, tags, assignments, attachments, category, project } = req.body;

    const query = `
      UPDATE tasks
      SET title = $1, description = $2, status = $3, priority = $4, startDate = $5, dueDate = $6, tags = $7, assignments = $8, attachments = $9, category = $10, project = $11
      WHERE id = $12
      RETURNING *
    `;
    const values = [title, description, status, priority, startDate, dueDate, tags, assignments, attachments, category, project, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// Route to delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM tasks WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

// Add this new route to fetch all unique tags
router.get('/tags', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT jsonb_array_elements_text(tags) as tag
      FROM tasks
      WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0
      ORDER BY tag ASC
    `;
    
    const result = await pool.query(query);
    const tags = result.rows.map(row => row.tag);
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server error fetching tags' });
  }
});

module.exports = router;
