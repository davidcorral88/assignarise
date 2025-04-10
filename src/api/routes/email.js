
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Replace with your SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com', // Replace with actual email in production
    pass: process.env.EMAIL_PASS || 'tbpb iqtt ehqz lwdy', // Replace with actual password in production
  },
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
    const { taskId, userId, allocatedHours } = req.body;
    
    if (!taskId || !userId) {
      return res.status(400).json({ error: 'Task ID and User ID are required' });
    }
    
    console.log(`Preparing to send task assignment email for task ${taskId} to user ${userId}`);
    
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
    
    // If user has no email, we can't send notification
    if (!user.email) {
      return res.status(400).json({ error: 'User has no email address' });
    }
    
    // Format dates for better readability
    const startDate = task.start_date ? new Date(task.start_date).toLocaleDateString('es-ES') : 'Non definida';
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Non definida';
    
    // Get task tags
    const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [taskId]);
    const tags = tagsResult.rows.map(row => row.tag).join(', ') || 'Ningunha';
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
      to: user.email,
      subject: `Nova asignación de tarefa: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Nova asignación de tarefa</h2>
          <p>Ola ${user.name},</p>
          <p>Asignóusevos unha nova tarefa no sistema de xestión.</p>
          
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
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    res.json({ 
      message: 'Task assignment email sent successfully',
      to: user.email,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

module.exports = router;
