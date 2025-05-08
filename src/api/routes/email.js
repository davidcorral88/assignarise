
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const nodemailer = require('nodemailer');

// Email configuration
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
    greetingTimeout: 30000,   // 30 seconds for SMTP greeting
    socketTimeout: 60000,     // 1 minute socket timeout
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

// Helper function to send emails with retry mechanism
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

// Check if user wants to receive email notifications
const shouldSendNotification = async (userId) => {
  try {
    const result = await pool.query('SELECT email_notification FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return false; // User not found
    }
    
    return result.rows[0].email_notification === true;
  } catch (error) {
    console.error('Error checking user notification preferences:', error);
    return false; // Default to not sending on error
  }
};

// Send task assignment notification
router.post('/send-task-assignment', async (req, res) => {
  try {
    const { taskId, userId, allocatedHours, isNewTask = false } = req.body;
    
    if (!taskId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`Preparing to send task assignment notification for task ${taskId} to user ${userId}`);

    // Check if user wants email notifications
    const wantsNotification = await shouldSendNotification(userId);
    if (!wantsNotification) {
      console.log(`User ${userId} has disabled email notifications`);
      return res.json({ 
        success: true, 
        message: 'User has disabled email notifications',
        notificationSent: false
      });
    }
    
    // Get task details
    const taskResult = await pool.query('SELECT title, description FROM tasks WHERE id = $1', [taskId]);
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get user details
    const userResult = await pool.query('SELECT name, email, "emailATSXPTPG" FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const task = taskResult.rows[0];
    const user = userResult.rows[0];
    
    // Build email body
    const action = isNewTask ? 'creada' : 'actualizada';
    
    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
      to: user.email,
      subject: `Tarefa ${action}: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Asignación de tarefa ${action}</h2>
          <p>Ola ${user.name},</p>
          <p>Foiche asignada unha tarefa no sistema de xestión de tarefas.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${task.title}</h3>
            <p><strong>Tempo asignado:</strong> ${allocatedHours || 'Non especificado'} horas</p>
            <p><strong>Descrición:</strong> ${task.description || 'Sen descrición'}</p>
          </div>
          
          <p>Podes ver os detalles completos da tarefa accedendo ao sistema:</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://rexistrodetarefas.iplanmovilidad.com'}/tasks/${taskId}" 
               style="display: inline-block; background-color: #2c7be5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Ver tarefa
            </a>
          </p>
          
          <p style="color: #777; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            Esta é unha mensaxe automática do sistema de xestión de tarefas. Por favor, non responda a este correo electrónico.
          </p>
        </div>
      `
    };
    
    // Add CC if emailATSXPTPG is available
    if (user.emailATSXPTPG) {
      mailOptions.cc = user.emailATSXPTPG;
    }

    // Send email with retry logic
    console.log(`Sending task assignment email to ${user.email}`);
    
    // Return success immediately to prevent blocking the API
    res.json({ 
      success: true, 
      message: 'Email notification queued for sending',
      notificationSent: true
    });
    
    // Send email asynchronously
    const emailResult = await sendEmailWithRetry(mailOptions);
    console.log('Task assignment email result:', emailResult);
    
  } catch (error) {
    console.error('Error sending task assignment notification:', error);
    // If this fails, we still return a 200 response because it's a background process
    // but we log the error for debugging
    res.status(200).json({ 
      success: false, 
      message: 'Error sending email notification',
      error: error.message
    });
  }
});

module.exports = router;
