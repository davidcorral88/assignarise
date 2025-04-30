
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

// Configure email transporter with better error handling and longer timeout settings
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
    connectionTimeout: 120000, // 2 minute connection timeout (increased)
    greetingTimeout: 60000,    // 1 minute for SMTP greeting (increased)
    socketTimeout: 120000,     // 2 minute socket timeout (increased)
    debug: true,               // Enable debug logs
    logger: true,              // Enable logger
    tls: {
      rejectUnauthorized: false // Less strict about certificates
    },
    maxConnections: 1,         // Limit concurrent connections
    maxMessages: 5,            // Limit messages per connection
    pool: false,               // Don't use connection pooling for more control
    // Add error handling for connection issues
    onError: (err) => {
      console.error('Nodemailer transport error:', err);
    }
  });
} catch (error) {
  console.error('Failed to create email transporter', error);
}

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({ 
        status: 'Email server configuration failed',
        error: 'Transporter not created'
      });
    }
    
    try {
      // Try to verify SMTP connection with promise handling
      await new Promise((resolve, reject) => {
        const verifyTimeout = setTimeout(() => {
          reject(new Error('SMTP verification timed out after 15 seconds'));
        }, 15000);
        
        transporter.verify()
          .then(result => {
            clearTimeout(verifyTimeout);
            resolve(result);
          })
          .catch(err => {
            clearTimeout(verifyTimeout);
            reject(err);
          });
      });
      
      res.json({ status: 'Email server connection successful' });
    } catch (verifyError) {
      console.error('Email server verify error:', verifyError);
      res.status(500).json({ 
        status: 'Email server connection failed during verify', 
        details: verifyError.message,
        code: verifyError.code,
        command: verifyError.command
      });
    }
  } catch (error) {
    console.error('Email server test error:', error);
    res.status(500).json({ 
      status: 'Email server test failed', 
      details: error.message 
    });
  }
});

// Email configuration status route
router.get('/status', async (req, res) => {
  try {
    if (!transporter) {
      return res.json({
        configured: false,
        message: 'Email transporter not configured'
      });
    }
    
    try {
      // Attempt a lightweight connection test with proper promise handling
      await new Promise((resolve, reject) => {
        const statusTimeout = setTimeout(() => {
          reject(new Error('SMTP verification timed out after 5 seconds'));
        }, 5000);
        
        transporter.verify({ timeout: 5000 }) // Short timeout for quick checking
          .then(result => {
            clearTimeout(statusTimeout);
            resolve(result);
          })
          .catch(err => {
            clearTimeout(statusTimeout);
            reject(err);
          });
      });
      
      res.json({
        configured: true,
        status: 'connected',
        message: 'Email system is configured and connected'
      });
    } catch (error) {
      res.json({
        configured: true,
        status: 'error',
        message: 'Email system is configured but connection failed',
        error: error.message,
        code: error.code
      });
    }
  } catch (error) {
    res.status(500).json({
      configured: false,
      status: 'error',
      message: 'Failed to check email system status',
      error: error.message
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
    
    // Quick check if email system is configured
    if (!transporter) {
      return res.json({ 
        message: 'Email service is not configured',
        status: 'skipped',
        emailSent: false
      });
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
        status: 'skipped',
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
    
    // Try to send the email with proper promise handling to avoid callback issues
    try {
      // Wrap in a promise with a timeout to prevent hanging
      const emailPromise = new Promise((resolve, reject) => {
        const sendTimeout = setTimeout(() => {
          reject(new Error('Email sending timed out after 30 seconds'));
        }, 30000); // Set 30 second timeout for email sending
        
        transporter.sendMail(mailOptions)
          .then(info => {
            clearTimeout(sendTimeout);
            resolve(info);
          })
          .catch(err => {
            clearTimeout(sendTimeout);
            reject(err);
          });
      });
      
      const info = await emailPromise;
      console.log('Email sent successfully:', info.messageId);
      
      res.json({ 
        message: 'Task assignment email sent',
        status: 'success',
        to: recipientEmail
      });
    } catch (emailError) {
      console.error('Error in email sending:', emailError);
      
      res.json({ 
        message: 'Task assignment email failed',
        status: 'error',
        error: emailError.message,
        to: recipientEmail
      });
    }
    
  } catch (error) {
    console.error('Error processing task assignment email:', error);
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
});

module.exports = router;
