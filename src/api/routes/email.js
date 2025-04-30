
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

// Configure email transporter with longer timeout settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Replace with your SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com', // Replace with actual email in production
    pass: process.env.EMAIL_PASS || 'tbpb iqtt ehqz lwdy', // Replace with actual password in production
  },
  connectionTimeout: 60000, // 1 minute connection timeout
  greetingTimeout: 30000, // 30 seconds for SMTP greeting
  socketTimeout: 60000,   // 1 minute socket timeout
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
    
    // Send the email with promise handling to prevent blocking
    const sendEmailPromise = transporter.sendMail(mailOptions)
      .then(info => {
        console.log('Email sent successfully:', info.messageId);
        return info;
      })
      .catch(error => {
        console.error('Error in email sending:', error);
        // We log the error but don't throw it to prevent failing the whole request
        return { error: error.message, sent: false };
      });
    
    // Return success immediately without waiting for email to complete sending
    res.json({ 
      message: 'Task assignment email sending in progress',
      to: recipientEmail,
      async: true
    });
    
    // Let the email sending continue in the background
    await sendEmailPromise;
    
  } catch (error) {
    console.error('Error processing task assignment email:', error);
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
});

module.exports = router;
