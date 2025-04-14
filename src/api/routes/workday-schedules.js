
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all workday schedules
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM workday_schedules ORDER BY name';
    const result = await pool.query(query);
    
    // Format the response to match the expected WorkdaySchedule type in the frontend
    const schedules = result.rows.map(schedule => {
      // Parse days_of_week from string to array if needed
      const days_of_week = Array.isArray(schedule.days_of_week) ? 
        schedule.days_of_week : 
        JSON.parse(schedule.days_of_week || '[]');
      
      return {
        id: schedule.id.toString(),
        name: schedule.name,
        type: schedule.type || "Standard",
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        breakStart: schedule.break_start || null,
        breakEnd: schedule.break_end || null,
        days_of_week: days_of_week,
        monday: days_of_week.includes(1),
        tuesday: days_of_week.includes(2),
        wednesday: days_of_week.includes(3),
        thursday: days_of_week.includes(4),
        friday: days_of_week.includes(5),
        saturday: days_of_week.includes(6),
        sunday: days_of_week.includes(7),
        // Add hours for each day
        mondayHours: schedule.monday_hours || null,
        tuesdayHours: schedule.tuesday_hours || null,
        wednesdayHours: schedule.wednesday_hours || null,
        thursdayHours: schedule.thursday_hours || null,
        fridayHours: schedule.friday_hours || null
      };
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching workday schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workday schedule by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM workday_schedules WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workday schedule not found' });
    }
    
    const schedule = result.rows[0];
    
    // Parse days_of_week from string to array if needed
    const days_of_week = Array.isArray(schedule.days_of_week) ? 
      schedule.days_of_week : 
      JSON.parse(schedule.days_of_week || '[]');
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      name: schedule.name,
      type: schedule.type || "Standard",
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      breakStart: schedule.break_start || null,
      breakEnd: schedule.break_end || null,
      days_of_week: days_of_week,
      monday: days_of_week.includes(1),
      tuesday: days_of_week.includes(2),
      wednesday: days_of_week.includes(3),
      thursday: days_of_week.includes(4),
      friday: days_of_week.includes(5),
      saturday: days_of_week.includes(6),
      sunday: days_of_week.includes(7),
      mondayHours: schedule.monday_hours || null,
      tuesdayHours: schedule.tuesday_hours || null,
      wednesdayHours: schedule.wednesday_hours || null,
      thursdayHours: schedule.thursday_hours || null,
      fridayHours: schedule.friday_hours || null
    };
    
    res.json(formattedSchedule);
  } catch (error) {
    console.error('Error fetching workday schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new workday schedule
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      type, 
      start_time, 
      end_time, 
      breakStart, 
      breakEnd, 
      days_of_week,
      mondayHours,
      tuesdayHours,
      wednesdayHours,
      thursdayHours,
      fridayHours
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!start_time) {
      return res.status(400).json({ error: 'Start time is required' });
    }
    
    if (!end_time) {
      return res.status(400).json({ error: 'End time is required' });
    }
    
    if (!days_of_week || !Array.isArray(days_of_week) || days_of_week.length === 0) {
      return res.status(400).json({ error: 'At least one day of the week must be selected' });
    }
    
    const query = `
      INSERT INTO workday_schedules 
      (name, type, start_time, end_time, break_start, break_end, days_of_week,
       monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *
    `;
    
    const values = [
      name,
      type || 'Standard',
      start_time,
      end_time,
      breakStart || null,
      breakEnd || null,
      JSON.stringify(days_of_week),
      mondayHours || null,
      tuesdayHours || null,
      wednesdayHours || null,
      thursdayHours || null,
      fridayHours || null
    ];
    
    const result = await pool.query(query, values);
    const schedule = result.rows[0];
    
    // Parse days_of_week from string to array if needed
    const parsedDays = Array.isArray(schedule.days_of_week) ? 
      schedule.days_of_week : 
      JSON.parse(schedule.days_of_week || '[]');
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      name: schedule.name,
      type: schedule.type || "Standard",
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      breakStart: schedule.break_start || null,
      breakEnd: schedule.break_end || null,
      days_of_week: parsedDays,
      monday: parsedDays.includes(1),
      tuesday: parsedDays.includes(2),
      wednesday: parsedDays.includes(3),
      thursday: parsedDays.includes(4),
      friday: parsedDays.includes(5),
      saturday: parsedDays.includes(6),
      sunday: parsedDays.includes(7),
      mondayHours: schedule.monday_hours || null,
      tuesdayHours: schedule.tuesday_hours || null,
      wednesdayHours: schedule.wednesday_hours || null,
      thursdayHours: schedule.thursday_hours || null,
      fridayHours: schedule.friday_hours || null
    };
    
    res.status(201).json(formattedSchedule);
  } catch (error) {
    console.error('Error adding workday schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing workday schedule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      type, 
      start_time, 
      end_time, 
      breakStart, 
      breakEnd, 
      days_of_week,
      mondayHours,
      tuesdayHours,
      wednesdayHours,
      thursdayHours,
      fridayHours
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!start_time) {
      return res.status(400).json({ error: 'Start time is required' });
    }
    
    if (!end_time) {
      return res.status(400).json({ error: 'End time is required' });
    }
    
    if (!days_of_week || !Array.isArray(days_of_week) || days_of_week.length === 0) {
      return res.status(400).json({ error: 'At least one day of the week must be selected' });
    }
    
    const query = `
      UPDATE workday_schedules 
      SET name = $1, type = $2, start_time = $3, end_time = $4, 
          break_start = $5, break_end = $6, days_of_week = $7,
          monday_hours = $8, tuesday_hours = $9, wednesday_hours = $10,
          thursday_hours = $11, friday_hours = $12
      WHERE id = $13
      RETURNING *
    `;
    
    const values = [
      name,
      type || 'Standard',
      start_time,
      end_time,
      breakStart || null,
      breakEnd || null,
      JSON.stringify(days_of_week),
      mondayHours || null,
      tuesdayHours || null,
      wednesdayHours || null,
      thursdayHours || null,
      fridayHours || null,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workday schedule not found' });
    }
    
    const schedule = result.rows[0];
    
    // Parse days_of_week from string to array if needed
    const parsedDays = Array.isArray(schedule.days_of_week) ? 
      schedule.days_of_week : 
      JSON.parse(schedule.days_of_week || '[]');
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      name: schedule.name,
      type: schedule.type || "Standard",
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      breakStart: schedule.break_start || null,
      breakEnd: schedule.break_end || null,
      days_of_week: parsedDays,
      monday: parsedDays.includes(1),
      tuesday: parsedDays.includes(2),
      wednesday: parsedDays.includes(3),
      thursday: parsedDays.includes(4),
      friday: parsedDays.includes(5),
      saturday: parsedDays.includes(6),
      sunday: parsedDays.includes(7),
      mondayHours: schedule.monday_hours || null,
      tuesdayHours: schedule.tuesday_hours || null,
      wednesdayHours: schedule.wednesday_hours || null,
      thursdayHours: schedule.thursday_hours || null,
      fridayHours: schedule.friday_hours || null
    };
    
    res.json(formattedSchedule);
  } catch (error) {
    console.error('Error updating workday schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a workday schedule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM workday_schedules WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workday schedule not found' });
    }
    
    res.json({ message: 'Workday schedule deleted successfully', schedule: result.rows[0] });
  } catch (error) {
    console.error('Error deleting workday schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
