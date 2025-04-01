
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Migration endpoint - to help with the migration process
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { users, tasks, timeEntries, vacationDays, workSchedule, workdaySchedules, holidays } = req.body;
    
    // Clear existing data if specified
    const clearExisting = req.query.clear === 'true';
    if (clearExisting) {
      await client.query('TRUNCATE task_tags, task_assignments, time_entries, tasks, vacation_days, workday_schedules, reduced_periods, holidays, users CASCADE');
    }
    
    // Insert users
    if (users && users.length > 0) {
      for (const user of users) {
        await client.query(
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
          [user.id, user.name, user.email, user.role, user.avatar, 
           user.organization, user.phone, user.email_notification, user.active ?? true]
        );
      }
    }
    
    // Insert tasks and related data
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        // Insert task
        await client.query(
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
          [task.id, task.title, task.description, task.status, task.created_by, 
           task.created_at, task.start_date, task.due_date, task.priority, 
           task.category, task.project]
        );
        
        // Insert tags
        if (task.tags && task.tags.length > 0) {
          // Delete existing tags first
          await client.query('DELETE FROM task_tags WHERE task_id = $1', [task.id]);
          
          for (const tag of task.tags) {
            await client.query(
              'INSERT INTO task_tags (task_id, tag) VALUES ($1, $2)',
              [task.id, tag]
            );
          }
        }
        
        // Insert assignments
        if (task.assignments && task.assignments.length > 0) {
          // Delete existing assignments first
          await client.query('DELETE FROM task_assignments WHERE task_id = $1', [task.id]);
          
          for (const assignment of task.assignments) {
            await client.query(
              'INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES ($1, $2, $3)',
              [task.id, assignment.user_id, assignment.allocated_hours]
            );
          }
        }
      }
    }
    
    // Insert time entries
    if (timeEntries && timeEntries.length > 0) {
      for (const entry of timeEntries) {
        await client.query(
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
          [entry.id, entry.task_id, entry.user_id, entry.hours, entry.date, 
           entry.notes, entry.category, entry.project, entry.activity, entry.time_format]
        );
      }
    }
    
    // Insert vacation days
    if (vacationDays && vacationDays.length > 0) {
      for (const vacationDay of vacationDays) {
        await client.query(
          `INSERT INTO vacation_days (user_id, date, type) 
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, date) DO UPDATE SET 
             type = EXCLUDED.type`,
          [vacationDay.user_id, vacationDay.date, vacationDay.type]
        );
      }
    }
    
    // Insert workSchedule
    if (workSchedule) {
      // First check if there's already a record
      const scheduleCheck = await client.query('SELECT id FROM work_schedule LIMIT 1');
      
      if (scheduleCheck.rows.length > 0) {
        const scheduleId = scheduleCheck.rows[0].id;
        
        await client.query(
          `UPDATE work_schedule SET 
             regular_hours_monday_to_thursday = $1, 
             regular_hours_friday = $2, 
             reduced_hours_daily = $3
           WHERE id = $4`,
          [workSchedule.regular_hours_monday_to_thursday, 
           workSchedule.regular_hours_friday,
           workSchedule.reduced_hours_daily,
           scheduleId]
        );
        
        // Delete existing reduced periods
        await client.query('DELETE FROM reduced_periods WHERE work_schedule_id = $1', [scheduleId]);
        
        // Insert reduced periods
        if (workSchedule.reduced_periods && workSchedule.reduced_periods.length > 0) {
          for (const period of workSchedule.reduced_periods) {
            await client.query(
              'INSERT INTO reduced_periods (work_schedule_id, start_date, end_date) VALUES ($1, $2, $3)',
              [scheduleId, period.start_date, period.end_date]
            );
          }
        }
      } else {
        // Insert new work schedule
        const scheduleResult = await client.query(
          `INSERT INTO work_schedule (regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily) 
           VALUES ($1, $2, $3) RETURNING id`,
          [workSchedule.regular_hours_monday_to_thursday, 
           workSchedule.regular_hours_friday,
           workSchedule.reduced_hours_daily]
        );
        
        const scheduleId = scheduleResult.rows[0].id;
        
        // Insert reduced periods
        if (workSchedule.reduced_periods && workSchedule.reduced_periods.length > 0) {
          for (const period of workSchedule.reduced_periods) {
            await client.query(
              'INSERT INTO reduced_periods (work_schedule_id, start_date, end_date) VALUES ($1, $2, $3)',
              [scheduleId, period.start_date, period.end_date]
            );
          }
        }
      }
    }
    
    // Insert workday schedules
    if (workdaySchedules && workdaySchedules.length > 0) {
      for (const schedule of workdaySchedules) {
        await client.query(
          `INSERT INTO workday_schedules (id, type, start_date, end_date, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours) 
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
          [schedule.id, schedule.type, schedule.start_date, schedule.end_date, 
           schedule.monday_hours, schedule.tuesday_hours, schedule.wednesday_hours, 
           schedule.thursday_hours, schedule.friday_hours]
        );
      }
    }
    
    // Insert holidays
    if (holidays && holidays.length > 0) {
      for (const holiday of holidays) {
        await client.query(
          `INSERT INTO holidays (date, name) 
           VALUES ($1, $2)
           ON CONFLICT (date) DO UPDATE SET 
             name = EXCLUDED.name`,
          [holiday.date, holiday.name]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Migration completed successfully',
      migrated: {
        users: users?.length || 0,
        tasks: tasks?.length || 0,
        timeEntries: timeEntries?.length || 0,
        vacationDays: vacationDays?.length || 0,
        workSchedule: workSchedule ? 1 : 0,
        workdaySchedules: workdaySchedules?.length || 0,
        holidays: holidays?.length || 0
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during migration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Migration failed', 
      details: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
