const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const nodemailer = require('nodemailer');

// Configurar el transporter de email (reutilizando la configuración de email.js)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
    pass: process.env.EMAIL_PASS || 'tbpb iqtt ehqz lwdy',
  },
});

// Endpoint para ejecutar manualmente la revisión (para pruebas)
router.post('/run', async (req, res) => {
  try {
    const result = await runDailyReview();
    res.json(result);
  } catch (error) {
    console.error('Error al ejecutar la revisión diaria:', error);
    res.status(500).json({ error: 'Error al ejecutar la revisión diaria', details: error.message });
  }
});

// Endpoint para verificar el próximo tiempo de ejecución
router.get('/next-execution', async (req, res) => {
  try {
    const config = await getReviewConfig();
    if (!config || config.enabled !== 'S') {
      return res.json({ enabled: false });
    }

    res.json({
      enabled: true,
      nextExecution: config.reviewTime,
      notificationEmails: config.notificationEmails
    });
  } catch (error) {
    console.error('Error al obtener información de próxima ejecución:', error);
    res.status(500).json({ error: 'Error al obtener información' });
  }
});

// Función para obtener la configuración de revisión
async function getReviewConfig() {
  const result = await pool.query('SELECT * FROM review_config ORDER BY id DESC LIMIT 1');
  
  if (result.rows.length > 0) {
    return {
      enabled: result.rows[0].enabled,
      reviewTime: result.rows[0].review_time,
      notificationEmails: result.rows[0].notification_emails
    };
  }
  
  return null;
}

// Función para verificar si un día es laborable
async function isWorkingDay(date) {
  // Formato de la fecha para consulta SQL: YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];
  
  // Verificar si es fin de semana (0 = domingo, 6 = sábado)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log(`La fecha ${formattedDate} es fin de semana (${dayOfWeek === 0 ? 'domingo' : 'sábado'})`);
    return false;
  }
  
  // Verificar si es un día festivo
  const holidayQuery = `SELECT * FROM holidays WHERE date::date = $1::date`;
  const holidayResult = await pool.query(holidayQuery, [formattedDate]);
  
  if (holidayResult.rows.length > 0) {
    console.log(`La fecha ${formattedDate} es festivo: ${holidayResult.rows[0].name}`);
    return false;
  }
  
  // Si no es fin de semana ni festivo, es día laborable
  console.log(`La fecha ${formattedDate} es día laborable`);
  return true;
}

// Función para obtener las horas de trabajo requeridas para un día específico según la jornada del usuario
async function getRequiredHours(userId, date) {
  // Formato de la fecha para consulta SQL: YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];
  
  try {
    // Obtener la jornada del usuario para la fecha
    const scheduleQuery = `
      SELECT ws.*, wds.* 
      FROM work_schedule ws
      JOIN workday_schedules wds ON ws.workday_schedule_id = wds.id
      WHERE ws.user_id = $1
        AND ws.start_date <= $2
        AND (ws.end_date IS NULL OR ws.end_date >= $2)
      ORDER BY ws.start_date DESC
      LIMIT 1
    `;
    
    const scheduleResult = await pool.query(scheduleQuery, [userId, formattedDate]);
    
    // Si no hay jornada asignada, asumimos 8 horas por defecto
    if (scheduleResult.rows.length === 0) {
      console.log(`No se encontró jornada para el usuario ${userId} en la fecha ${formattedDate}, usando valores por defecto`);
      return 8; // Valor por defecto
    }
    
    // Obtener las horas según el día de la semana
    const dayOfWeek = date.getDay(); // 0 es domingo, 1 es lunes, etc.
    let requiredHours = 8; // Valor por defecto
    
    const schedule = scheduleResult.rows[0];
    
    switch(dayOfWeek) {
      case 1: // Lunes
        requiredHours = schedule.mondayhours || schedule.monday_hours || 8;
        break;
      case 2: // Martes
        requiredHours = schedule.tuesdayhours || schedule.tuesday_hours || 8;
        break;
      case 3: // Miércoles
        requiredHours = schedule.wednesdayhours || schedule.wednesday_hours || 8;
        break;
      case 4: // Jueves
        requiredHours = schedule.thursdayhours || schedule.thursday_hours || 8;
        break;
      case 5: // Viernes
        requiredHours = schedule.fridayhours || schedule.friday_hours || 7;
        break;
      default:
        requiredHours = 0; // Fin de semana
    }
    
    console.log(`Horas requeridas para usuario ${userId} en ${formattedDate} (${dayOfWeek}): ${requiredHours}`);
    return requiredHours;
  } catch (error) {
    console.error(`Error al obtener horas requeridas para usuario ${userId} en ${formattedDate}:`, error);
    return 8; // Valor por defecto en caso de error
  }
}

// Función para obtener las horas trabajadas por un usuario en una fecha específica
async function getWorkedHours(userId, date) {
  // Formato de la fecha para consulta SQL: YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];
  
  const query = `
    SELECT SUM(hours) as total_hours
    FROM time_entries
    WHERE user_id = $1 AND date = $2
  `;
  
  const result = await pool.query(query, [userId, formattedDate]);
  const totalHours = parseFloat(result.rows[0].total_hours || 0);
  
  console.log(`Horas trabajadas por usuario ${userId} en ${formattedDate}: ${totalHours}`);
  return totalHours;
}

// Función para enviar alertas de horas no imputadas
async function sendAlert(user, date, workedHours, requiredHours, notificationEmails) {
  const formattedDate = date.toISOString().split('T')[0];
  const dateForDisplay = new Date(date).toLocaleDateString('es-ES');
  const horasFaltantes = requiredHours - workedHours;
  
  // Correos que recibirán la notificación
  let recipients = [];
  
  // Email principal del usuario
  if (user.email) {
    recipients.push(user.email);
  }
  
  // Emails de notificación en copia
  if (notificationEmails) {
    // Dividir los emails y limpiar espacios en blanco
    const notificationList = notificationEmails.split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
      
    recipients = [...recipients, ...notificationList];
  }
  
  // Si no hay destinatarios, no enviamos email
  if (recipients.length === 0) {
    console.log(`No hay destinatarios para la alerta de ${user.name}`);
    return false;
  }
  
  console.log(`Enviando alerta a: ${recipients.join(', ')}`);
  
  // Crear el contenido del email
  const mailOptions = {
    from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
    to: recipients.join(', '),
    subject: `Alerta: Horas non imputadas - ${dateForDisplay}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Alerta de horas non imputadas</h2>
        <p>Ola ${user.name},</p>
        <p>Detectouse que non imputou todas as horas de traballo correspondentes ao día <strong>${dateForDisplay}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Información de horas</h3>
          <p><strong>Horas imputadas:</strong> ${workedHours.toFixed(2)}</p>
          <p><strong>Horas requeridas:</strong> ${requiredHours.toFixed(2)}</p>
          <p><strong style="color: #e63946;">Horas faltantes:</strong> ${horasFaltantes.toFixed(2)}</p>
        </div>
        
        <p>Por favor, imputar as horas faltantes o antes posible a través do sistema de control de tarefas.</p>
        <p style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'https://rexistrodetarefas.iplanmovilidad.com'}/time-tracking" 
             style="display: inline-block; background-color: #2c7be5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Acceder ao rexistro de horas
          </a>
        </p>
        
        <p style="color: #777; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          Esta é unha mensaxe automática do sistema de xestión de tarefas. Por favor, non responda a este correo electrónico.
        </p>
      </div>
    `
  };
  
  // Enviar el email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Alerta enviada a ${user.name}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error al enviar alerta a ${user.name}:`, error);
    return false;
  }
}

// Función principal para ejecutar la revisión diaria
async function runDailyReview() {
  console.log('Iniciando proceso de revisión diaria de horas');
  
  // Obtener configuración de revisión
  const config = await getReviewConfig();
  
  if (!config || config.enabled !== 'S') {
    console.log('La revisión diaria está desactivada');
    return { executed: false, reason: 'disabled' };
  }
  
  // Fecha actual y fecha a revisar (día anterior)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  console.log(`Fecha actual: ${today.toISOString().split('T')[0]}`);
  console.log(`Día a revisar: ${yesterday.toISOString().split('T')[0]}`);
  
  // Verificar si el día anterior fue laborable
  const wasWorkingDay = await isWorkingDay(yesterday);
  
  if (!wasWorkingDay) {
    console.log('El día anterior no fue laborable, no se realiza revisión');
    return { executed: false, reason: 'not_working_day' };
  }
  
  try {
    // Primero, verifica si la columna email_notification es tipo boolean o varchar
    const columnsResult = await pool.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'email_notification'
    `);
    
    let emailNotificationType = 'boolean';
    if (columnsResult.rows.length > 0) {
      emailNotificationType = columnsResult.rows[0].data_type;
      console.log(`Tipo de dato para email_notification: ${emailNotificationType}`);
    }
    
    // Construir la consulta dinámica basada en el tipo de datos
    let usersQuery;
    if (emailNotificationType === 'boolean') {
      usersQuery = `
        SELECT * FROM users 
        WHERE active = true 
          AND (organization = 'iPlan' OR organization ILIKE 'iplan%')
          AND (email_notification IS NULL OR email_notification = true)
      `;
    } else {
      // Asumiendo que es character varying y usa 'S'/'N' como en otras partes del código
      usersQuery = `
        SELECT * FROM users 
        WHERE active = true 
          AND (organization = 'iPlan' OR organization ILIKE 'iplan%')
          AND (email_notification IS NULL OR email_notification = 'S')
      `;
    }
    
    const usersResult = await pool.query(usersQuery);
    const users = usersResult.rows;
    
    console.log(`Encontrados ${users.length} usuarios para revisar`);
    
    // Resultados de la revisión
    const results = {
      executed: true,
      date: yesterday.toISOString().split('T')[0],
      totalUsers: users.length,
      alertsSent: 0,
      usersWithMissingHours: []
    };
    
    // Iterar sobre cada usuario
    for (const user of users) {
      console.log(`Revisando horas para usuario: ${user.name} (${user.id})`);
      
      // Obtener las horas requeridas para ese día según la jornada
      const requiredHours = await getRequiredHours(user.id, yesterday);
      
      // Si no se requieren horas (ej: puede ser un día libre específico), continuamos
      if (requiredHours <= 0) {
        console.log(`No se requieren horas para ${user.name} en la fecha ${yesterday.toISOString().split('T')[0]}`);
        continue;
      }
      
      // Obtener las horas trabajadas
      const workedHours = await getWorkedHours(user.id, yesterday);
      
      // Comprobar si hay déficit de horas
      if (workedHours < requiredHours) {
        console.log(`¡Alerta! ${user.name} tiene déficit de horas: ${workedHours} / ${requiredHours}`);
        
        // Enviar alerta por email
        const alertSent = await sendAlert(
          user, 
          yesterday, 
          workedHours, 
          requiredHours, 
          config.notificationEmails
        );
        
        if (alertSent) {
          results.alertsSent++;
        }
        
        // Registrar usuario con horas faltantes
        results.usersWithMissingHours.push({
          userId: user.id,
          name: user.name,
          email: user.email,
          workedHours,
          requiredHours,
          missingHours: requiredHours - workedHours,
          alertSent
        });
      } else {
        console.log(`${user.name} cumple con las horas requeridas: ${workedHours} / ${requiredHours}`);
      }
    }
    
    console.log(`Revisión completada. Alertas enviadas: ${results.alertsSent}`);
    return results;
  } catch (error) {
    console.error('Error en el proceso de revisión diaria:', error);
    throw error;
  }
}

// Programar la ejecución diaria según la configuración
async function scheduleReview() {
  try {
    // Obtener la configuración actual
    const config = await getReviewConfig();
    
    if (!config || config.enabled !== 'S') {
      console.log('Revisión diaria desactivada, no se programa');
      return;
    }
    
    // Calcular el tiempo hasta la próxima ejecución
    const now = new Date();
    const [hours, minutes] = config.reviewTime.split(':').map(Number);
    
    const executionTime = new Date();
    executionTime.setHours(hours, minutes, 0, 0);
    
    // Si la hora ya pasó hoy, programar para mañana
    if (executionTime <= now) {
      executionTime.setDate(executionTime.getDate() + 1);
    }
    
    const timeUntilExecution = executionTime.getTime() - now.getTime();
    
    console.log(`Próxima revisión programada para: ${executionTime.toLocaleString()}`);
    console.log(`Tiempo hasta ejecución: ${Math.floor(timeUntilExecution / 60000)} minutos`);
    
    // Programar la ejecución con safe setTimeout (max 2147483647 ms ≈ 24.8 días)
    const maxTimeout = 2147483647;
    
    if (timeUntilExecution > maxTimeout) {
      // Si el tiempo es mayor que el máximo permitido, programar para el máximo
      // y luego reprogramar
      setTimeout(() => {
        scheduleReview(); // Volver a programar después del timeout máximo
      }, maxTimeout);
    } else {
      // Programar normalmente si está dentro del límite
      setTimeout(async () => {
        try {
          console.log('Ejecutando revisión diaria programada');
          await runDailyReview();
        } catch (error) {
          console.error('Error al ejecutar revisión diaria programada:', error);
        } finally {
          // Volver a programar para el día siguiente
          scheduleReview();
        }
      }, timeUntilExecution);
    }
  } catch (error) {
    console.error('Error al programar revisión diaria:', error);
    // Reintentar en 1 hora en caso de error
    setTimeout(scheduleReview, 3600000);
  }
}

// Iniciar la programación en un proceso separado para no bloquear el inicio del servidor
setTimeout(() => {
  scheduleReview()
    .catch(error => console.error('Error en la programación inicial:', error));
}, 10000); // Esperar 10 segundos después del inicio del servidor

module.exports = router;
