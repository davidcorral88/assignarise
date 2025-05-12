
const nodemailer = require('nodemailer');

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

// Track current configuration
let currentConfigIndex = 0;
let transporter = null;

// Initialize the transporter if it doesn't exist
const initTransporter = () => {
  if (!transporter) {
    transporter = createTransporter(currentConfigIndex);
  }
  return transporter;
};

// Create transporter with the specified configuration
function createTransporter(configIndex = 0) {
  // Ensure index is within bounds
  const index = Math.min(configIndex, smtpConfigurations.length - 1);
  const config = smtpConfigurations[index];
  
  console.log(`Creating email transporter with configuration #${index + 1}:`, {
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

// Switch to next configuration and recreate transporter
const switchToNextConfig = () => {
  currentConfigIndex = (currentConfigIndex + 1) % smtpConfigurations.length;
  console.log(`Switching to email configuration #${currentConfigIndex + 1}`);
  transporter = createTransporter(currentConfigIndex);
  return transporter;
};

// Function to send email with retry and fallback logic
async function sendEmailWithRetry(mailOptions, maxRetries = 3, maxConfigs = smtpConfigurations.length) {
  let retries = 0;
  let configAttempts = 0;
  let lastError = null;

  // Ensure we have a transporter
  if (!transporter) {
    initTransporter();
  }

  while (configAttempts < maxConfigs) {
    retries = 0;
    
    while (retries < maxRetries) {
      try {
        // If we've had a previous error, recreate the transporter if needed
        if (lastError && retries === 0 && configAttempts > 0) {
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
      switchToNextConfig();
    }
  }

  console.error(`All ${maxRetries * maxConfigs} attempts to send email to ${mailOptions.to} failed.`);
  throw lastError;
}

// Helper function to generate random password
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Email templates
const templates = {
  // Template for password reset email
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

// Public API
module.exports = {
  getTransporter: initTransporter,
  createTransporter,
  getCurrentConfigIndex: () => currentConfigIndex,
  getCurrentConfig: () => smtpConfigurations[currentConfigIndex],
  sendEmailWithRetry,
  generateRandomPassword,
  switchToNextConfig,
  templates,
  // Export configurations for potential direct access
  smtpConfigurations
};
