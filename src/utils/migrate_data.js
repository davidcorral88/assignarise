
/**
 * Script para migrar datos da base de datos antiga (task_management_v04)
 * á nova base de datos (controltarefasv2)
 * 
 * Uso: node migrate_data.js
 */

const { Pool } = require('pg');

// Configuración de conexión á base de datos antiga
const sourceConfig = {
  user: 'task_control',
  host: 'localhost',
  database: 'task_management_v04',
  password: 'dc0rralIplan',
  port: 5433,
};

// Configuración de conexión á nova base de datos
const targetConfig = {
  user: 'task_control',
  host: 'localhost',
  database: 'controltarefasv2',
  password: 'dc0rralIplan',
  port: 5433,
};

// Función para converter IDs de string a número
const toNumericId = (id) => {
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed)) return parsed;
  }
  throw new Error(`ID inválido: ${id}`);
};

// Pool de conexións para ambas bases de datos
const sourcePool = new Pool(sourceConfig);
const targetPool = new Pool(targetConfig);

// Función principal de migración
async function migrateData() {
  console.log('Iniciando migración de datos...');

  // Usar transacción para garantir a integridade dos datos
  const sourceClient = await sourcePool.connect();
  const targetClient = await targetPool.connect();

  try {
    await targetClient.query('BEGIN');
    
    // 1. Migrar usuarios
    console.log('Migrando usuarios...');
    const usersResult = await sourceClient.query('SELECT * FROM users');
    
    for (const user of usersResult.rows) {
      const userId = toNumericId(user.id);
      
      await targetClient.query(
        `INSERT INTO users (id, name, email, role, avatar, organization, phone, email_notification, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           avatar = EXCLUDED.avatar,
           organization = EXCLUDED.organization,
           phone = EXCLUDED.phone,
           email_notification = EXCLUDED.email_notification,
           active = EXCLUDED.active`,
        [userId, user.name, user.email, user.role, user.avatar, 
         user.organization, user.phone, user.email_notification, user.active]
      );
    }
    
    // 2. Migrar tarefas
    console.log('Migrando tarefas...');
    const tasksResult = await sourceClient.query('SELECT * FROM tasks');
    
    for (const task of tasksResult.rows) {
      const taskId = toNumericId(task.id);
      const createdBy = toNumericId(task.created_by);
      
      await targetClient.query(
        `INSERT INTO tasks (id, title, description, status, created_by, created_at, 
          start_date, due_date, priority, category, project)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           status = EXCLUDED.status,
           created_by = EXCLUDED.created_by,
           created_at = EXCLUDED.created_at,
           start_date = EXCLUDED.start_date,
           due_date = EXCLUDED.due_date,
           priority = EXCLUDED.priority,
           category = EXCLUDED.category,
           project = EXCLUDED.project`,
        [taskId, task.title, task.description, task.status, createdBy,
         task.created_at, task.start_date, task.due_date, task.priority,
         task.category, task.project]
      );
    }
    
    // 3. Migrar tags de tarefas
    console.log('Migrando tags das tarefas...');
    const tagsResult = await sourceClient.query('SELECT * FROM task_tags');
    
    for (const tag of tagsResult.rows) {
      const taskId = toNumericId(tag.task_id);
      
      await targetClient.query(
        `INSERT INTO task_tags (task_id, tag)
         VALUES ($1, $2)
         ON CONFLICT (task_id, tag) DO NOTHING`,
        [taskId, tag.tag]
      );
    }
    
    // 4. Migrar asignacións de tarefas
    console.log('Migrando asignacións de tarefas...');
    const assignmentsResult = await sourceClient.query('SELECT * FROM task_assignments');
    
    for (const assignment of assignmentsResult.rows) {
      const taskId = toNumericId(assignment.task_id);
      const userId = toNumericId(assignment.user_id);
      
      await targetClient.query(
        `INSERT INTO task_assignments (task_id, user_id, allocated_hours)
         VALUES ($1, $2, $3)
         ON CONFLICT (task_id, user_id) DO UPDATE SET
           allocated_hours = EXCLUDED.allocated_hours`,
        [taskId, userId, assignment.allocated_hours]
      );
    }
    
    // 5. Migrar rexistros de tempo
    console.log('Migrando rexistros de tempo...');
    const timeEntriesResult = await sourceClient.query('SELECT * FROM time_entries');
    
    for (const entry of timeEntriesResult.rows) {
      const entryId = toNumericId(entry.id);
      const taskId = toNumericId(entry.task_id);
      const userId = toNumericId(entry.user_id);
      
      await targetClient.query(
        `INSERT INTO time_entries (id, task_id, user_id, hours, date, notes, category, project, activity, time_format)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           task_id = EXCLUDED.task_id,
           user_id = EXCLUDED.user_id,
           hours = EXCLUDED.hours,
           date = EXCLUDED.date,
           notes = EXCLUDED.notes,
           category = EXCLUDED.category,
           project = EXCLUDED.project,
           activity = EXCLUDED.activity,
           time_format = EXCLUDED.time_format`,
        [entryId, taskId, userId, entry.hours, entry.date, entry.notes, 
         entry.category, entry.project, entry.activity, entry.time_format]
      );
    }
    
    // 6. Migrar días de vacacións
    console.log('Migrando días de vacacións...');
    const vacationDaysResult = await sourceClient.query('SELECT * FROM vacation_days');
    
    for (const vacationDay of vacationDaysResult.rows) {
      const userId = toNumericId(vacationDay.user_id);
      
      await targetClient.query(
        `INSERT INTO vacation_days (user_id, date, type)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, date) DO UPDATE SET
           type = EXCLUDED.type`,
        [userId, vacationDay.date, vacationDay.type]
      );
    }
    
    // 7. Migrar configuración de horarios
    console.log('Migrando configuración de horarios de traballo...');
    const workScheduleResult = await sourceClient.query('SELECT * FROM work_schedule');
    
    if (workScheduleResult.rows.length > 0) {
      const workSchedule = workScheduleResult.rows[0];
      
      await targetClient.query(
        `INSERT INTO work_schedule (id, regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           regular_hours_monday_to_thursday = EXCLUDED.regular_hours_monday_to_thursday,
           regular_hours_friday = EXCLUDED.regular_hours_friday,
           reduced_hours_daily = EXCLUDED.reduced_hours_daily`,
        [workSchedule.id, workSchedule.regular_hours_monday_to_thursday, 
         workSchedule.regular_hours_friday, workSchedule.reduced_hours_daily]
      );
      
      // Migrar períodos reducidos
      const reducedPeriodsResult = await sourceClient.query(
        'SELECT * FROM reduced_periods WHERE work_schedule_id = $1', 
        [workSchedule.id]
      );
      
      for (const period of reducedPeriodsResult.rows) {
        await targetClient.query(
          `INSERT INTO reduced_periods (work_schedule_id, start_date, end_date)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [period.work_schedule_id, period.start_date, period.end_date]
        );
      }
    }
    
    // 8. Migrar horarios por día da semana
    console.log('Migrando horarios por día da semana...');
    const workdaySchedulesResult = await sourceClient.query('SELECT * FROM workday_schedules');
    
    for (const schedule of workdaySchedulesResult.rows) {
      const scheduleId = toNumericId(schedule.id);
      
      await targetClient.query(
        `INSERT INTO workday_schedules (id, type, start_date, end_date, monday_hours,
           tuesday_hours, wednesday_hours, thursday_hours, friday_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           type = EXCLUDED.type,
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           monday_hours = EXCLUDED.monday_hours,
           tuesday_hours = EXCLUDED.tuesday_hours,
           wednesday_hours = EXCLUDED.wednesday_hours,
           thursday_hours = EXCLUDED.thursday_hours,
           friday_hours = EXCLUDED.friday_hours`,
        [scheduleId, schedule.type, schedule.start_date, schedule.end_date, 
         schedule.monday_hours, schedule.tuesday_hours, schedule.wednesday_hours, 
         schedule.thursday_hours, schedule.friday_hours]
      );
    }
    
    // 9. Migrar festivos (que puideran faltar nos insertados por defecto)
    console.log('Migrando festivos adicionais...');
    const holidaysResult = await sourceClient.query('SELECT * FROM holidays');
    
    for (const holiday of holidaysResult.rows) {
      await targetClient.query(
        `INSERT INTO holidays (date, name)
         VALUES ($1, $2)
         ON CONFLICT (date) DO UPDATE SET
           name = EXCLUDED.name`,
        [holiday.date, holiday.name]
      );
    }
    
    await targetClient.query('COMMIT');
    
    console.log('Migración completada con éxito!');
    
  } catch (error) {
    await targetClient.query('ROLLBACK');
    console.error('Erro na migración:', error);
    throw error;
  } finally {
    sourceClient.release();
    targetClient.release();
    
    // Pechar os pools de conexión
    await sourcePool.end();
    await targetPool.end();
  }
}

// Executar a migración
migrateData()
  .then(() => console.log('Proceso de migración finalizado.'))
  .catch(error => {
    console.error('Erro fatal durante a migración:', error);
    process.exit(1);
  });
