
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const nodemailer = require('nodemailer');

// Default password - defined directly to avoid dependency issues
const DEFAULT_PASSWORD = 'dc0rralIplan';

// Configure email transporter with longer timeouts and better error handling
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
      pass: process.env.EMAIL_PASS || 'tbpb iqtt ehqz lwdy',
    },
    connectionTimeout: 60000, // 1 minute connection timeout
    greetingTimeout: 30000, // 30 seconds for SMTP greeting
    socketTimeout: 60000,    // 1 minute socket timeout
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    },
    pool: true, // Use connection pooling for better performance
    maxConnections: 5,
    maxMessages: 100
  });
  
  // Verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Email server connection error:', error);
    } else {
      console.log("Email server connection is ready to receive messages");
    }
  });
} catch (error) {
  console.error('Error creating email transporter:', error);
}

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

// Retry email sending logic
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      console.log(`Sending email, attempt ${attempt}/${maxRetries}`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      lastError = error;
      console.error(`Email sending attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait longer between retries
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All email sending attempts failed');
  return { success: false, error: lastError };
};

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
    const userCheck = await pool.query('SELECT email, name, "emailATSXPTPG" FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];
    const recipientEmail = user.email;
    const emailATSXPTPG = user.emailATSXPTPG;
    
    // Generate new random password
    const newPassword = generateRandomPassword();

    // Update password in database
    await pool.query('DELETE FROM user_passwords WHERE user_id = $1', [userId]);
    await pool.query('INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)', [userId, newPassword]);

    // Set up email options with CC if available
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
    
    // Add CC if emailATSXPTPG is available
    if (emailATSXPTPG) {
      mailOptions.cc = emailATSXPTPG;
    }

    // Return success immediately without waiting for email to complete sending
    res.json({ 
      success: true,
      message: 'Password reset successful and email sending in progress'
    });
    
    // Send email with retry logic in the background
    const emailResult = await sendEmailWithRetry(mailOptions);
    console.log('Password reset email result:', emailResult);
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
