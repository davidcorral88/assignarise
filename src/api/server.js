const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express application
const app = express();
const port = 3000;

// Configure middleware
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:5551', 
    'http://185.166.213.17:8080',
    'https://rexistrodetarefas.iplanmovilidad.com',
    'https://www.rexistrodetarefas.iplanmovilidad.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: 'task_control',
  host: 'localhost',
  database: 'task_management',
  password: 'dc0rralIplan',
  port: 5433,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// API status endpoint
app.get('/api/status', async (req, res) => {
  try {
    // Check the actual database connection
    const dbResult = await pool.query('SELECT NOW()');
    
    res.json({
      status: 'online',
      database: 'connected',
      message: 'API is running and database is connected',
      dbTime: dbResult.rows[0].now,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection check failed:', error);
    res.json({
      status: 'online',
      database: 'disconnected',
      message: 'API is running but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint redirects to status
app.get('/api', (req, res) => {
  res.redirect('/api/status');
});

// User endpoints
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { id, name, email, role, avatar, active } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (id, name, email, role, avatar, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, email, role, avatar, active || true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar, active } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, avatar = $4, active = $5 WHERE id = $6 RETURNING *',
      [name, email, role, avatar, active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get task tags
    const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [id]);
    const tags = tagsResult.rows.map(row => row.tag);
    
    // Get task assignments
    const assignmentsResult = await pool.query('SELECT user_id, allocated_hours FROM task_assignments WHERE task_id = $1', [id]);
    
    const task = {
      ...result.rows[0],
      tags,
      assignments: assignmentsResult.rows
    };
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add endpoint to get next task ID
app.get('/api/tasks/next-id', async (req, res) => {
  try {
    const result = await pool.query('SELECT MAX(CAST(id AS INTEGER)) as max_id FROM tasks');
    const nextId = result.rows[0].max_id ? parseInt(result.rows[0].max_id) + 1 : 1;
    res.json({ nextId });
  } catch (error) {
    console.error('Error getting next task ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fix task creation endpoint
app.post('/api/tasks', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      id, title, description, status, createdBy, createdAt, 
      startDate, dueDate, priority, category, project, tags, assignments 
    } = req.body;
    
    console.log('Received task data:', {
      id, title, status, createdBy, startDate, dueDate, 
      tags: tags?.length, 
      assignments: assignments?.length
    });
    
    // Insert task
    const taskResult = await client.query(
      `INSERT INTO tasks (id, title, description, status, created_by, created_at, 
        start_date, due_date, priority, category, project) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, title, description, status, createdBy, createdAt || new Date(), 
       startDate, dueDate, priority, category, project]
    );
    
    const task = taskResult.rows[0];
    
    // Insert tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          'INSERT INTO task_tags (task_id, tag) VALUES ($1, $2)',
          [task.id, tag]
        );
      }
    }
    
    // Insert assignments
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        await client.query(
          'INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES ($1, $2, $3)',
          [task.id, assignment.userId, assignment.allocatedHours]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return complete task with tags and assignments
    task.tags = tags || [];
    task.assignments = assignments || [];
    
    res.status(201).json(task);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { 
      title, description, status, start_date, due_date, 
      priority, category, project, tags, assignments 
    } = req.body;
    
    // Update task
    const taskResult = await client.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, 
       start_date = $4, due_date = $5, priority = $6, category = $7, project = $8
       WHERE id = $9 RETURNING *`,
      [title, description, status, start_date, due_date, priority, category, project, id]
    );
    
    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = taskResult.rows[0];
    
    // Update tags (delete and insert)
    await client.query('DELETE FROM task_tags WHERE task_id = $1', [id]);
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          'INSERT INTO task_tags (task_id, tag) VALUES ($1, $2)',
          [id, tag]
        );
      }
    }
    
    // Update assignments (delete and insert)
    await client.query('DELETE FROM task_assignments WHERE task_id = $1', [id]);
    
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        await client.query(
          'INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES ($1, $2, $3)',
          [id, assignment.user_id, assignment.allocated_hours]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return complete task with tags and assignments
    task.tags = tags || [];
    task.assignments = assignments || [];
    
    res.json(task);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Time entries endpoints
app.get('/api/time_entries', async (req, res) => {
  try {
    const { user_id, task_id, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM time_entries';
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    
    if (task_id) {
      conditions.push(`task_id = $${params.length + 1}`);
      params.push(task_id);
    }
    
    if (start_date) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(start_date);
    }
    
    if (end_date) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(end_date);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/time_entries', async (req, res) => {
  try {
    const { id, task_id, user_id, hours, date, notes, category, project, activity, time_format } = req.body;
    
    const result = await pool.query(
      `INSERT INTO time_entries (id, task_id, user_id, hours, date, notes, category, project, activity, time_format) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, task_id, user_id, hours, date, notes, category, project, activity, time_format]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Holidays endpoints
app.get('/api/holidays', async (req, res) => {
  try {
    const { year } = req.query;
    
    let query = 'SELECT * FROM holidays';
    const params = [];
    
    if (year) {
      query += ' WHERE EXTRACT(YEAR FROM date) = $1';
      params.push(year);
    }
    
    query += ' ORDER BY date';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vacation days endpoints
app.get('/api/vacation_days', async (req, res) => {
  try {
    const { user_id, year } = req.query;
    
    let query = 'SELECT * FROM vacation_days';
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    
    if (year) {
      conditions.push(`EXTRACT(YEAR FROM date) = $${params.length + 1}`);
      params.push(year);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY date';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vacation days:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Migration endpoint - to help with the migration process
app.post('/api/migrate', async (req, res) => {
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

// Start server - listen on all interfaces, not just localhost
app.listen(port, '0.0.0.0', () => {
  console.log(`API server running at http://0.0.0.0:${port}/api`);
  console.log(`For remote access, make sure port ${port} is accessible and properly forwarded`);
  console.log(`CORS enabled for: http://localhost:8080, http://localhost:5551, http://185.166.213.17:8080, https://rexistrodetarefas.iplanmovilidad.com`);
});
