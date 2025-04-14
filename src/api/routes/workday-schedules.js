
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
      // Por defecto, asumimos que se trabaja de lunes a viernes
      const days_of_week = [1, 2, 3, 4, 5];
      
      return {
        id: schedule.id.toString(),
        name: schedule.name,
        type: schedule.type || "Standard",
        start_time: schedule.start_time || "08:00",
        end_time: schedule.end_time || "16:00",
        days_of_week: days_of_week,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        // Horas específicas para cada día
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
    
    // Por defecto, asumimos que se trabaja de lunes a viernes
    const days_of_week = [1, 2, 3, 4, 5];
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      name: schedule.name,
      type: schedule.type || "Standard",
      start_time: schedule.start_time || "08:00",
      end_time: schedule.end_time || "16:00",
      days_of_week: days_of_week,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
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
    
    // Predeterminados
    const start_time = "08:00";
    const end_time = "16:00";
    const days_of_week = [1, 2, 3, 4, 5]; // Lunes a viernes
    
    const query = `
      INSERT INTO workday_schedules 
      (name, type, start_time, end_time, days_of_week,
       monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    
    const values = [
      name,
      type || 'Standard',
      start_time,
      end_time,
      JSON.stringify(days_of_week),
      mondayHours || null,
      tuesdayHours || null,
      wednesdayHours || null,
      thursdayHours || null,
      fridayHours || null
    ];
    
    const result = await pool.query(query, values);
    const schedule = result.rows[0];
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      name: schedule.name,
      type: schedule.type || "Standard",
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      days_of_week: days_of_week,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
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
    
    // Predeterminados
    const start_time = "08:00";
    const end_time = "16:00";
    const days_of_week = [1, 2, 3, 4, 5]; // Lunes a viernes
    
    const query = `
      UPDATE workday_schedules 
      SET name = $1, type = $2, start_time = $3, end_time = $4, days_of_week = $5,
          monday_hours = $6, tuesday_hours = $7, wednesday_hours = $8,
          thursday_hours = $9, friday_hours = $10
      WHERE id = $11
      RETURNING *
    `;
    
    const values = [
      name,
      type || 'Standard',
      start_time,
      end_time,
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
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      name: schedule.name,
      type: schedule.type || "Standard",
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      days_of_week: days_of_week,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
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
