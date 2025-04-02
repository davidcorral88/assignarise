
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
    
    // Try to parse as integer first for ID lookup
    const numericId = !isNaN(parseInt(id, 10)) ? parseInt(id, 10) : null;
    
    if (numericId !== null) {
      // If id can be parsed as a number, search by id
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [numericId]);
      if (result.rows.length > 0) {
        return res.json(result.rows[0]);
      }
    }
    
    // If not found by numeric ID or id is not numeric, try to find by email
    const result2 = await pool.query('SELECT * FROM users WHERE email = $1', [id]);
    if (result2.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result2.rows[0]);
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
    
    // Ensure id is treated as an integer
    const numericId = parseInt(id, 10);
    
    const result = await pool.query(
      'INSERT INTO users (id, name, email, role, avatar, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [numericId, name, email, role, avatar, active || true]
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
    
    // Ensure id is an integer
    const numericId = parseInt(id, 10);
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, avatar = $4, active = $5 WHERE id = $6 RETURNING *',
      [name, email, role, avatar, active, numericId]
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
    
    // Ensure id is an integer
    const numericId = parseInt(id, 10);
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [numericId]);
    
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
