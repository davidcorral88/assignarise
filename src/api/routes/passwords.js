const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const nodemailer = require('nodemailer');

// Configure email transporter with improved timeout settings and connection retries
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
    pass: process.env.EMAIL_PASS || 'tbpb iqtt ehqz lwdy',
  },
  // Enhanced timeout settings
  connectionTimeout: 90000, // 90 seconds connection timeout
  greetingTimeout: 60000,   // 60 seconds for SMTP greeting
  socketTimeout: 90000,     // 90 seconds socket timeout
  // Add retry mechanism
  pool: true,               // Use pooled connections
  maxConnections: 5,        // Limit number of connections
  maxMessages: 100,         // Limit number of messages per connection
  // TLS options
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
    ciphers: 'SSLv3'           // Use legacy ciphers for compatibility
  }
});

// Helper function to generate random password
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

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

// Helper function for email sending with retry logic
const sendEmailWithRetry = async (mailOptions, maxRetries = 3, retryDelay = 3000) => {
  let attempt = 1;
  
  while (attempt <= maxRetries) {
    try {
      console.log(`Password reset email sending attempt ${attempt} of ${maxRetries}`);
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error(`Password reset email sending attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        attempt++;
      } else {
        console.error('Password reset email sending failed after max retries:', error);
        throw error;
      }
    }
  }
};

// Reset user password (admin function)
router.post('/reset', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists and get their email
    const userCheck = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];
    const recipientEmail = user.email;

    // Generate new random password
    const newPassword = generateRandomPassword();

    // Update password in database
    await pool.query('DELETE FROM user_passwords WHERE user_id = $1', [userId]);
    await pool.query('INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)', [userId, newPassword]);

    // Email options for password reset
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
      to: recipientEmail,
      subject: 'Reseteo de contrasinal - Sistema de Tarefas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Reseteo de contrasinal</h2>
          <p>Ola ${user.name},</p>
          <p>O seu contrasinal foi reseteado por un administrador no sistema de xestión de tarefas.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>O seu novo contrasinal é:</strong> ${newPassword}</p>
          </div>
          
          <p>Por razóns de seguridade, recomendámoslle que cambie este contrasinal a primeira vez que inicie sesión.</p>
          
          <p>Pode acceder ao sistema no seguinte enlace:</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://rexistrodetarefas.iplanmovilidad.com'}" 
               style="display: inline-block; background-color: #2c7be5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Acceder ao sistema
            </a>
          </p>
          
          <p style="color: #777; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            Esta é unha mensaxe automática do sistema de xestión de tarefas. Por favor, non responda a este correo electrónico.
          </p>
        </div>
      `
    };

    // Return success immediately without waiting for email to complete sending
    res.json({ 
      success: true,
      message: 'Password reset successful and email sending in progress'
    });
    
    // Let the email sending continue in the background with retry logic
    try {
      await sendEmailWithRetry(mailOptions);
    } catch (error) {
      // We log the error but don't throw it since the HTTP response has already been sent
      console.error('Final password reset email sending error:', error);
      // Could log to database or notification system for admin follow-up
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
