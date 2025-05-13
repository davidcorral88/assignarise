
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const emailService = require('../services/emailService');

// Default password - defined directly to avoid dependency issues
const DEFAULT_PASSWORD = 'dc0rralIplan';

// Verify user password
router.post('/verify', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId && !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    // Check if default password
    if (password === DEFAULT_PASSWORD) {
      return res.json({ isValid: true });
    }

    // Check in user_passwords table
    const result = await pool.query('SELECT password_hash FROM user_passwords WHERE user_id = $1', [userId]);
    
    if (result.rows.length === 0) {
      // If no password set, default password is valid
      return res.json({ isValid: password === DEFAULT_PASSWORD });
    }
    
    const isValid = result.rows[0].password_hash === password;
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
        const result = await pool.query('SELECT password_hash FROM user_passwords WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
          isCurrentPasswordValid = result.rows[0].password_hash === currentPassword;
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
      await pool.query('UPDATE user_passwords SET password_hash = $1 WHERE user_id = $2', [newPassword, userId]);
    } else {
      // Insert new password
      await pool.query('INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)', [userId, newPassword]);
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

    // Check if user exists and get their email
    // Use correct column name case - "emailATSXPTPG"
    const userCheck = await pool.query('SELECT email, "emailATSXPTPG", name, email_notification FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];
    
    // Check if user has explicitly disabled email notifications
    if (user.email_notification === false) {
      console.log(`User ${userId} (${user.name}) has email notifications disabled.`);
      
      // Generate new random password without sending email
      const newPassword = emailService.generateRandomPassword();
      
      // Update password in database
      await pool.query('DELETE FROM user_passwords WHERE user_id = $1', [userId]);
      await pool.query('INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)', [userId, newPassword]);
      
      return res.json({
        success: true,
        message: 'Password reset successful. User has email notifications disabled, returning password directly.',
        password: newPassword // Return password since email won't be sent
      });
    }
    
    // Prefer emailATSXPTPG if available, otherwise use regular email
    const recipientEmail = user.emailATSXPTPG || user.email;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'User has no email address' });
    }

    // Generate new random password
    const newPassword = emailService.generateRandomPassword();

    // Update password in database
    await pool.query('DELETE FROM user_passwords WHERE user_id = $1', [userId]);
    await pool.query('INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)', [userId, newPassword]);

    // Return success immediately without waiting for email to complete sending
    res.json({ 
      success: true,
      message: 'Password reset successful and email sending in progress'
    });
    
    // Create email content using template
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <rexistrodetarefas@gmail.com>',
      to: recipientEmail,
      subject: 'Reseteo de contrasinal - Sistema de Tarefas',
      html: emailService.templates.passwordReset({
        user,
        password: newPassword
      })
    };
    
    // Send email with retry using our enhanced function
    try {
      await emailService.sendEmailWithRetry(mailOptions);
      console.log(`Password reset email successfully sent to ${recipientEmail}`);
    } catch (error) {
      console.error(`Final failure sending password reset email to ${recipientEmail}:`, error);
      // We don't propagate this error since the API already responded
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
