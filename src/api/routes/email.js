const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

// List of SMTP configurations to try in order
const smtpConfigurations = [
  // Option 1: SSL on port 465 (most secure)
  {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 30000, // reduce timeout to fail faster
  },
  // Option 2: TLS on port 587 (standard)
  {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 30000,
  },
  // Option 3: Direct Gmail API (as fallback)
  {
    service: 'gmail',
    connectionTimeout: 30000,
  }
];

// Create transporter with the first configuration
function createTransporter(configIndex = 0) {
  // Ensure index is within bounds
  const index = Math.min(configIndex, smtpConfigurations.length - 1);
  const config = smtpConfigurations[index];
  
  console.log(`Trying email configuration #${index + 1}:`, {
    host: config.host || config.service,
    port: config.port,
    secure: config.secure
  });
  
  return nodemailer.createTransport({
    ...config,
    auth: {
      user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
      pass: process.env.EMAIL_PASS || 'uvbg gqwi oosj ehzq',
    },
    // Common options
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
}

// Initial transporter with first configuration
let transporter = createTransporter(0);
let currentConfigIndex = 0;

// Function to send email with retry and fallback logic
async function sendEmailWithRetry(mailOptions, maxRetries = 3, maxConfigs = smtpConfigurations.length) {
  let retries = 0;
  let configAttempts = 0;
  let lastError = null;

  while (configAttempts < maxConfigs) {
    retries = 0;
    
    while (retries < maxRetries) {
      try {
        // If we've had a previous error, recreate the transporter if needed
        if (lastError && retries === 0) {
          console.log(`Using email configuration #${currentConfigIndex + 1} for ${mailOptions.to}`);
        }

        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${mailOptions.to}:`, result.messageId);
        return result;
      } catch (error) {
        retries++;
        lastError = error;
        console.error(`Email sending attempt ${retries} with config #${currentConfigIndex + 1} failed:`, error.message);
        
        // Wait before retrying (exponential backoff)
        if (retries < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, retries), 30000); // Max 30 seconds
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If all retries failed with current config, try next config
    configAttempts++;
    if (configAttempts < maxConfigs) {
      currentConfigIndex = (currentConfigIndex + 1) % smtpConfigurations.length;
      console.log(`Switching to email configuration #${currentConfigIndex + 1} after ${maxRetries} failed attempts`);
      transporter = createTransporter(currentConfigIndex);
    }
  }

  console.error(`All ${maxRetries * maxConfigs} attempts to send email to ${mailOptions.to} failed.`);
  throw lastError;
}

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ 
      status: 'Email server connection successful',
      configuration: currentConfigIndex + 1,
      details: smtpConfigurations[currentConfigIndex]
    });
  } catch (error) {
    console.error('Email server connection error:', error);
    
    // Try next configuration immediately for the test endpoint
    const nextConfigIndex = (currentConfigIndex + 1) % smtpConfigurations.length;
    transporter = createTransporter(nextConfigIndex);
    currentConfigIndex = nextConfigIndex;
    
    res.status(500).json({ 
      error: 'Email server connection failed', 
      details: error.message,
      nextAttempt: `Will try configuration #${currentConfigIndex + 1} on next request`
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
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
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
