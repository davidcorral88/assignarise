const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

// Configure email transporter with corporate SMTP settings
const transporter = nodemailer.createTransport({
  host: 'mail.iplanmovilidad.com',
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: 'dcorral@iplanmovilidad.com',
    pass: 'dc0rralIplan!!!',
  },
  connectionTimeout: 10000, // 10 seconds timeout for connection
  greetingTimeout: 5000,    // 5 seconds for greeting
  socketTimeout: 10000,     // 10 seconds for socket operations
  logger: process.env.NODE_ENV !== 'production' // Enable logging in development
});

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ status: 'Email server connection successful' });
  } catch (error) {
    console.error('Email server connection error:', error);
    res.status(500).json({ error: 'Email server connection failed', details: error.message });
  }
});

// Send task assignment notification - optimized for performance
router.post('/send-task-assignment', async (req, res) => {
  try {
    const { taskId, userId, allocatedHours, isNewTask } = req.body;
    
    if (!taskId || !userId) {
      return res.status(400).json({ error: 'Task ID and User ID are required' });
    }
    
    // Get task details - with reduced fields for efficiency
    const taskResult = await pool.query(
      'SELECT title, status, priority, start_date, due_date FROM tasks WHERE id = $1', 
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = taskResult.rows[0];
    
    // Get user details - with reduced fields for efficiency
    const userResult = await pool.query(
      'SELECT name, email, email_atsxptpg FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Determine which email to use - prefer the ATSXPTPG email if available
    const recipientEmail = user.email_atsxptpg || user.email;
    
    if (!recipientEmail) {
      return res.status(400).json({ error: 'User has no email address' });
    }
    
    // Format dates for better readability
    const startDate = task.start_date ? new Date(task.start_date).toLocaleDateString('es-ES') : 'Non definida';
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Non definida';
    
    // Different subject for new task vs updated task assignment
    const emailSubject = isNewTask 
      ? `Nova asignación de tarefa: ${task.title}`
      : `Actualización de tarefa asignada: ${task.title}`;
      
    // Create email content - simplified HTML for faster processing
    const mailOptions = {
      from: 'dcorral@iplanmovilidad.com',
      to: recipientEmail,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">${emailSubject}</h2>
          <p>Ola ${user.name},</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Detalles da tarefa</h3>
            <p><strong>Título:</strong> ${task.title}</p>
            <p><strong>Estado:</strong> ${task.status}</p>
            <p><strong>Prioridade:</strong> ${task.priority}</p>
            <p><strong>Data de inicio:</strong> ${startDate}</p>
            <p><strong>Data de vencemento:</strong> ${dueDate}</p>
            <p><strong style="color: #2c7be5;">Horas asignadas:</strong> ${allocatedHours} horas</p>
          </div>
          
          <p>Pode acceder á tarefa no sistema de xestión no seguinte enlace:</p>
          <p><a href="https://rexistrodetarefas.iplanmovilidad.com/tasks/${taskId}" style="color: #2c7be5;">Ver detalles da tarefa</a></p>
        </div>
      `
    };
    
    // Send the email with timeout protection
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    res.json({ 
      message: 'Task assignment email sent successfully',
      to: recipientEmail,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message
    });
  }
});

module.exports = router;
