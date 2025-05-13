
const nodemailer = require('nodemailer');

/**
 * Servicio de correo electrónico simplificado y robusto
 * Este servicio utiliza una estrategia de reintentos y configuraciones alternativas
 * para maximizar la fiabilidad del envío de correos.
 */

// Configuración principal para envío de correos
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER || 'rexistrodetarefas@gmail.com',
      pass: process.env.EMAIL_PASS || 'eotw yyye yekr lqtd',
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: process.env.NODE_ENV !== 'production',
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

// Transportador de correo compartido
let transporter = null;

// Inicializa el transportador si no existe
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Función para enviar correo con reintentos
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let attempts = 0;
  let lastError = null;

  // Asegurar que tenemos un transportador
  if (!transporter) {
    getTransporter();
  }

  while (attempts < maxRetries) {
    try {
      // Si hemos tenido un error previo en el segundo intento o posterior, recrear el transportador
      if (lastError && attempts > 0) {
        console.log(`Recreando transportador para intento ${attempts + 1}...`);
        transporter = createTransporter();
      }

      const result = await transporter.sendMail(mailOptions);
      console.log(`Correo enviado con éxito a ${mailOptions.to}:`, result.messageId);
      return result;
    } catch (error) {
      attempts++;
      lastError = error;
      console.error(`Intento ${attempts} de ${maxRetries} falló:`, error.message);
      
      // Esperar antes de reintentar (backoff exponencial)
      if (attempts < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempts), 30000); // Máx 30 segundos
        console.log(`Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error(`Todos los ${maxRetries} intentos de envío a ${mailOptions.to} fallaron.`);
  throw lastError;
};

// Función auxiliar para generar contraseñas aleatorias
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Plantillas de correo
const templates = {
  // Template para password reset email
  passwordReset: ({user, password}) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Reseteo de contrasinal</h2>
        <p>Ola ${user.name},</p>
        <p>O seu contrasinal foi reseteado por un administrador no sistema de xestión de tarefas.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>O seu novo contrasinal é:</strong> ${password}</p>
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
    `;
  },
  
  // Template for task assignment notification
  taskAssignment: ({user, task, introMessage, startDate, dueDate, tags, allocatedHours, isNewTask, taskId}) => {
    return `
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
    `;
  }
};

// API pública
module.exports = {
  getTransporter,
  createTransporter,
  sendEmailWithRetry,
  generateRandomPassword,
  templates,
};
