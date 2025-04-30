
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

// Configure email transporter with longer timeout settings and failover options
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', // Replace with your SMTP server
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com', // Replace with actual email in production
      pass: process.env.EMAIL_PASS || 'tbpb iqtt ehqz lwdy', // Replace with actual password in production
    },
    connectionTimeout: 90000, // 90 seconds connection timeout
    greetingTimeout: 45000,  // 45 seconds for SMTP greeting
    socketTimeout: 90000,    // 90 seconds socket timeout
    tls: {
      rejectUnauthorized: false // Accept all certificates (for troubleshooting)
    },
    pool: true, // Use pooled connections
    maxConnections: 5, // Limit to 5 simultaneous connections
    maxMessages: 100, // Limit to 100 messages per connection
    rateLimit: 5, // Limit to 5 messages per second
  });
};

let transporter = createTransporter();

// Helper function to handle transporter errors
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    await getTransporter().verify();
    res.json({ status: 'Email server connection successful' });
  } catch (error) {
    console.error('Email server connection error:', error);
    res.status(500).json({ 
      error: 'Email server connection failed', 
      details: error.message,
      code: error.code
    });
  }
});

// Send task assignment notification
router.post('/send-task-assignment', async (req, res) => {
  try {
    const { taskId, userId, allocatedHours, isNewTask } = req.body;
    
    if (!taskId || !userId) {
      return res.status(400).json({ error: 'Task ID and User ID are required' });
    }
    
    console.log(`Preparing to send task assignment email for task ${taskId} to user ${userId} with ${allocatedHours} hours`);
    
    // Get task details
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = taskResult.rows[0];
    
    // Get user details
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    
    console.log(`Found user for notification:`, {
      userId,
      name: user.name,
      email: user.email,
      emailATSXPTPG: user.emailatsxptpg || 'No alternative email'
    });
    
    // Check if user has email notification enabled (defaulted to true if not specified)
    if (user.email_notification === false) {
      console.log(`User ${userId} (${user.name}) has email notifications disabled. Skipping notification.`);
      return res.json({ 
        message: 'Email notification skipped - user has disabled notifications',
        userId,
        userName: user.name
      });
    }
    
    // Determine which email to use - prefer the ATSXPTPG email if available
    const recipientEmail = user.emailatsxptpg || user.email;
    
    // If user has no email, we can't send notification
    if (!recipientEmail) {
      return res.status(400).json({ error: 'User has no email address' });
    }
    
    // Format dates for better readability
    const startDate = task.start_date ? new Date(task.start_date).toLocaleDateString('es-ES') : 'Non definida';
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Non definida';
    
    // Get task tags
    const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [taskId]);
    const tags = tagsResult.rows.map(row => row.tag).join(', ') || 'Ningunha';
    
    // Different subject for new task vs updated task assignment
    const emailSubject = isNewTask 
      ? `Nova asignación de tarefa: ${task.title}`
      : `Actualización de tarefa asignada: ${task.title}`;
      
    // Different intro message based on new vs updated task  
    const introMessage = isNewTask
      ? `Asignóusevos unha nova tarefa no sistema de xestión.`
      : `Actualizouse a vosa asignación dunha tarefa no sistema de xestión.`;
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
      to: recipientEmail,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">${isNewTask ? 'Nova asignación de tarefa' : 'Actualización de tarefa asignada'}</h2>
          <p>Ola ${user.name},</p>
          <p>${introMessage}</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Detalles da tarefa</h3>
            <p><strong>Título:</strong> ${task.title}</p>
            <p><strong>Descrición:</strong> ${task.description || 'Non dispoñible'}</p>
            <p><strong>Estado:</strong> ${task.status}</p>
            <p><strong>Prioridade:</strong> ${task.priority}</p>
            <p><strong>Data de inicio:</strong> ${startDate}</p>
            <p><strong>Data de vencemento:</strong> ${dueDate}</p>
            <p><strong>Etiquetas:</strong> ${tags}</p>
            <p><strong>Categoría:</strong> ${task.category || 'Non definida'}</p>
            <p><strong>Proxecto:</strong> ${task.project || 'Non definido'}</p>
            <p><strong style="color: #2c7be5;">Horas asignadas:</strong> ${allocatedHours} horas</p>
          </div>
          
          <p>Pode acceder á tarefa no sistema de xestión facendo clic no seguinte enlace:</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://rexistrodetarefas.iplanmovilidad.com'}/tasks/${taskId}" 
               style="display: inline-block; background-color: #2c7be5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Ver detalles da tarefa
            </a>
          </p>
          
          <p style="color: #777; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            Esta é unha mensaxe automática do sistema de xestión de tarefas. Por favor, non responda a este correo electrónico.
          </p>
        </div>
      `
    };
    
    // Return success immediately without waiting for email to complete sending
    // This ensures the API responds quickly and doesn't get blocked by email issues
    res.json({ 
      message: 'Task assignment email sending in progress',
      to: recipientEmail,
      async: true
    });
    
    // Send the email outside the request-response cycle
    try {
      const info = await getTransporter().sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error in email sending:', error);
      // The error is logged but doesn't affect the API response
      // We could store failed emails in a database for retry later
      
      // Reset transporter on connection errors to force recreation next time
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
        console.log('Resetting email transporter due to connection issues');
        transporter = null; // Force recreation on next use
      }
    }
  } catch (error) {
    console.error('Error processing task assignment email:', error);
    // If we get here, the response hasn't been sent yet
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
});

// Add endpoint for task modification emails
router.post('/send-task-modification', async (req, res) => {
  try {
    const { taskId, userId, isNewTask, taskTitle, taskStatus } = req.body;
    
    if (!taskId || !userId) {
      return res.status(400).json({ error: 'Task ID and User ID are required' });
    }
    
    console.log(`Preparing to send task modification email for task ${taskId} to user ${userId}`);
    
    // Get user details
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    
    // Determine which email to use - prefer the ATSXPTPG email if available
    const recipientEmail = user.emailatsxptpg || user.email;
    
    // If user has no email, we can't send notification
    if (!recipientEmail) {
      return res.status(400).json({ error: 'User has no email address' });
    }

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
      to: recipientEmail,
      subject: `Actualización de tarefa: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Actualización de tarefa</h2>
          <p>Ola ${user.name},</p>
          <p>Unha tarefa asignada a ti actualizouse no sistema:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Detalles da tarefa</h3>
            <p><strong>Título:</strong> ${taskTitle}</p>
            <p><strong>Estado actual:</strong> ${taskStatus}</p>
          </div>
          
          <p>Pode acceder á tarefa no sistema de xestión facendo clic no seguinte enlace:</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://rexistrodetarefas.iplanmovilidad.com'}/tasks/${taskId}" 
               style="display: inline-block; background-color: #2c7be5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Ver detalles da tarefa
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
      message: 'Task modification email sending in progress',
      to: recipientEmail,
      async: true
    });
    
    // Send the email outside the request-response cycle
    try {
      const info = await getTransporter().sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error in email sending:', error);
      
      // Reset transporter on connection errors to force recreation next time
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
        console.log('Resetting email transporter due to connection issues');
        transporter = null; // Force recreation on next use
      }
    }
  } catch (error) {
    console.error('Error processing task modification email:', error);
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
});

module.exports = router;
