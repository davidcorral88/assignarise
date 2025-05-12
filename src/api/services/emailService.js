
const nodemailer = require('nodemailer');

// Lista de configuraciones SMTP ordenadas por preferencia
const smtpConfigurations = [
  // Opción 1: TLS en puerto 587 (configuración recomendada para Gmail)
  {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 30000,
  },
  // Opción 2: SSL en puerto 465 (alternativa)
  {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 30000,
  },
  // Opción 3: Servicio directo de Gmail (como respaldo)
  {
    service: 'gmail',
    connectionTimeout: 30000,
  }
];

// Control de configuración actual
let currentConfigIndex = 0;
let transporter = null;

// Inicializa el transportador si no existe
const initTransporter = () => {
  if (!transporter) {
    transporter = createTransporter(currentConfigIndex);
  }
  return transporter;
};

// Crear transportador con la configuración especificada
function createTransporter(configIndex = 0) {
  // Asegurarse de que el índice esté dentro de los límites
  const index = Math.min(configIndex, smtpConfigurations.length - 1);
  const config = smtpConfigurations[index];
  
  console.log(`Creando transportador de correo con configuración #${index + 1}:`, {
    host: config.host || config.service,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS
  });
  
  return nodemailer.createTransport({
    ...config,
    auth: {
      user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
      pass: process.env.EMAIL_PASS || 'uvbg gqwi oosj ehzq',
    },
    // Opciones comunes
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
}

// Cambiar a la siguiente configuración y recrear el transportador
const switchToNextConfig = () => {
  currentConfigIndex = (currentConfigIndex + 1) % smtpConfigurations.length;
  console.log(`Cambiando a configuración de correo #${currentConfigIndex + 1}`);
  transporter = createTransporter(currentConfigIndex);
  return transporter;
};

// Función para enviar correo con reintento y lógica de respaldo
async function sendEmailWithRetry(mailOptions, maxRetries = 3, maxConfigs = smtpConfigurations.length) {
  let retries = 0;
  let configAttempts = 0;
  let lastError = null;

  // Asegurar que tenemos un transportador
  if (!transporter) {
    initTransporter();
  }

  while (configAttempts < maxConfigs) {
    retries = 0;
    
    while (retries < maxRetries) {
      try {
        // Si hemos tenido un error previo, recrear el transportador si es necesario
        if (lastError && retries === 0 && configAttempts > 0) {
          console.log(`Usando configuración de correo #${currentConfigIndex + 1} para ${mailOptions.to}`);
        }

        const result = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado con éxito a ${mailOptions.to}:`, result.messageId);
        return result;
      } catch (error) {
        retries++;
        lastError = error;
        console.error(`Intento ${retries} de envío con config #${currentConfigIndex + 1} falló:`, error.message);
        
        // Esperar antes de reintentar (backoff exponencial)
        if (retries < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, retries), 30000); // Máx 30 segundos
          console.log(`Esperando ${waitTime}ms antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // Si todos los reintentos fallaron con la configuración actual, probar la siguiente
    configAttempts++;
    if (configAttempts < maxConfigs) {
      switchToNextConfig();
    }
  }

  console.error(`Los ${maxRetries * maxConfigs} intentos de envío a ${mailOptions.to} fallaron.`);
  throw lastError;
}

// Función auxiliar para generar contraseñas aleatorias
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

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
  getTransporter: initTransporter,
  createTransporter,
  getCurrentConfigIndex: () => currentConfigIndex,
  getCurrentConfig: () => smtpConfigurations[currentConfigIndex],
  sendEmailWithRetry,
  generateRandomPassword,
  switchToNextConfig,
  templates,
  // Exportar configuraciones para posible acceso directo
  smtpConfigurations
};
