
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');
const emailService = require('../services/emailService');

// Prueba de configuración de correo
router.get('/test', async (req, res) => {
  try {
    const transporter = emailService.getTransporter();
    await transporter.verify();
    
    const configIndex = emailService.getCurrentConfigIndex();
    const currentConfig = emailService.getCurrentConfig();
    
    const authType = currentConfig.auth?.type || 'basic';
    
    res.json({ 
      status: 'Conexión con servidor de correo exitosa',
      configuration: configIndex + 1,
      authType: authType,
      details: {
        host: currentConfig.host || currentConfig.service,
        port: currentConfig.port,
        secure: currentConfig.secure,
        requireTLS: currentConfig.requireTLS,
        authType: authType
      }
    });
  } catch (error) {
    console.error('Error de conexión con servidor de correo:', error);
    
    // Intentar siguiente configuración inmediatamente para el endpoint de prueba
    emailService.switchToNextConfig();
    
    res.status(500).json({ 
      error: 'Falló la conexión con servidor de correo', 
      details: error.message,
      nextAttempt: `Se intentará con configuración #${emailService.getCurrentConfigIndex() + 1} en la próxima solicitud`
    });
  }
});

// Send task assignment notification with CC functionality
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
    
    // Get user details - Use correct column name case - "emailATSXPTPG"
    const userResult = await pool.query('SELECT id, name, email, "emailATSXPTPG", email_notification FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    
    console.log(`Found user for notification:`, {
      userId,
      name: user.name,
      email: user.email,
      emailATSXPTPG: user.emailATSXPTPG || 'No alternative email'
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
    const recipientEmail = user.emailATSXPTPG || user.email;
    
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
    
    // Include CC addresses if there are other users with emailATSXPTPG assigned to this task
    const ccAddresses = [];
    
    // Get all users assigned to this task - Use correct column name case
    const assignmentsResult = await pool.query(
      'SELECT u.id, u.name, u.email, u."emailATSXPTPG", u.email_notification FROM users u ' +
      'JOIN task_assignments ta ON u.id = ta.user_id ' +
      'WHERE ta.task_id = $1 AND u.id <> $2', // exclude current user
      [taskId, userId]
    );
    
    // Add emailATSXPTPG addresses to CC if available
    assignmentsResult.rows.forEach(assignedUser => {
      if (assignedUser.emailATSXPTPG && assignedUser.email_notification !== false) {
        ccAddresses.push(assignedUser.emailATSXPTPG);
      }
    });
    
    console.log(`Including ${ccAddresses.length} CC addresses:`, ccAddresses);
    
    // Create email content - using template helper
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
      to: recipientEmail,
      cc: ccAddresses.length > 0 ? ccAddresses.join(',') : undefined,
      subject: emailSubject,
      html: emailService.templates.taskAssignment({
        user,
        task,
        introMessage,
        startDate,
        dueDate,
        tags,
        allocatedHours,
        isNewTask,
        taskId
      })
    };
    
    // Return success immediately without waiting for email to complete sending
    res.json({ 
      message: 'Task assignment email sending in progress',
      to: recipientEmail,
      cc: ccAddresses.length > 0 ? ccAddresses : undefined,
      async: true
    });
    
    // Send email with retry using our enhanced function
    try {
      await emailService.sendEmailWithRetry(mailOptions);
      console.log(`Task assignment email successfully sent to ${recipientEmail}`);
    } catch (error) {
      console.error(`Final failure sending task assignment email to ${recipientEmail}:`, error);
      // We don't propagate this error since the API already responded
    }
    
  } catch (error) {
    console.error('Error processing task assignment email:', error);
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
});

module.exports = router;
