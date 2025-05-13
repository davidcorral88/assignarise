
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

// Email configuration with custom mail server
function createTransporter() {
  return nodemailer.createTransport({
    host: 'mail.temagc.com',
    port: 465,
    secure: true, // Use SSL for port 465
    auth: {
      user: process.env.EMAIL_USER || 'atsxptpg_tecnoloxico@iplanmovilidad.com',
      pass: process.env.EMAIL_PASS || 'H4.4n0iKuxkA',
    },
    connectionTimeout: 60000, // 1 minute connection timeout
    greetingTimeout: 30000,   // 30 seconds for SMTP greeting
    socketTimeout: 60000,     // 1 minute socket timeout
    // Add a retry strategy
    pool: true,               // Use connection pooling
    maxConnections: 5,        // Limit connections to avoid overload
    maxMessages: 100,         // Limit messages per connection
    debug: true,              // Enable debug logs for troubleshooting
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
}

// Create initial transporter
let transporter = createTransporter();

// Function to send email with retry logic
async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      // If we've had a previous error, recreate the transporter
      if (lastError) {
        console.log(`Retry attempt ${retries + 1} for email to ${mailOptions.to}`);
        transporter = createTransporter();
      }

      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${mailOptions.to}:`, result.messageId);
      return result;
    } catch (error) {
      retries++;
      lastError = error;
      console.error(`Email sending attempt ${retries} failed:`, error);
      
      // Wait before retrying (exponential backoff)
      if (retries < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, retries), 30000); // Max 30 seconds
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error(`All ${maxRetries} attempts to send email to ${mailOptions.to} failed.`);
  throw lastError;
}

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
    
    // Get user details - Fix: Use correct column name case - "emailATSXPTPG" instead of "emailatsxptpg"
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
    
    // Get all users assigned to this task - Fix: Use correct column name case
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
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <iplanmovilidad@gmail.com>',
      to: recipientEmail,
      cc: ccAddresses.length > 0 ? ccAddresses.join(',') : undefined,
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
    res.json({ 
      message: 'Task assignment email sending in progress',
      to: recipientEmail,
      cc: ccAddresses.length > 0 ? ccAddresses : undefined,
      async: true
    });
    
    // Send email with retry using our enhanced function
    try {
      await sendEmailWithRetry(mailOptions);
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
