
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Default password - defined directly to avoid dependency issues
const DEFAULT_PASSWORD = 'dc0rralIplan';

// Verify user password
router.post('/verify', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    console.log(`Verifying password for user ID: ${userId}`);
    
    // Check if default password
    if (password === DEFAULT_PASSWORD) {
      console.log('Default password matched');
      return res.json({ isValid: true });
    }

    // Check in user_passwords table
    const result = await pool.query('SELECT password FROM user_passwords WHERE user_id = $1', [userId]);
    
    if (result.rows.length === 0) {
      // If no password set, default password is valid
      console.log('No custom password set, using default');
      return res.json({ isValid: password === DEFAULT_PASSWORD });
    }
    
    const isValid = result.rows[0].password === password;
    console.log(`Password validation result: ${isValid}`);
    res.json({ isValid });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change user password
router.post('/change', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, adminOverride } = req.body;
    
    if (!userId || (!currentPassword && !adminOverride) || !newPassword) {
      return res.status(400).json({ error: 'Required parameters missing' });
    }

    // If adminOverride is true, skip current password verification
    let isCurrentPasswordValid = !!adminOverride;
    
    if (!adminOverride) {
      // Verify current password
      // Check if default password
      if (currentPassword === DEFAULT_PASSWORD) {
        isCurrentPasswordValid = true;
      } else {
        // Check in user_passwords table
        const result = await pool.query('SELECT password FROM user_passwords WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
          isCurrentPasswordValid = result.rows[0].password === currentPassword;
        }
      }

      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    // Now update or insert the new password
    const checkResult = await pool.query('SELECT 1 FROM user_passwords WHERE user_id = $1', [userId]);
    
    if (checkResult.rows.length > 0) {
      // Update existing password
      await pool.query('UPDATE user_passwords SET password = $1 WHERE user_id = $2', [newPassword, userId]);
    } else {
      // Insert new password
      await pool.query('INSERT INTO user_passwords (user_id, password) VALUES ($1, $2)', [userId, newPassword]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset user password (admin function)
router.post('/reset', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete any existing password record to revert to the default password
    await pool.query('DELETE FROM user_passwords WHERE user_id = $1', [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
