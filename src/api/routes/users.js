
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by id or email
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const result2 = await pool.query('SELECT * FROM users WHERE email = $1', [id]);
      if (result2.rows.length === 0) {
        return res.status(404).json({ error: 'User by email not found' });
      }
      else {
        res.json(result2.rows[0]);
      }
    }
    else {
      res.json(result.rows[0]);
    }
  }
  catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { id, name, email, role, avatar, active } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (id, name, email, role, avatar, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, email, role, avatar, active || true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar, active } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, avatar = $4, active = $5 WHERE id = $6 RETURNING *',
      [name, email, role, avatar, active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
