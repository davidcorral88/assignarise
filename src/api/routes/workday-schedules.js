
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all workday schedules
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, type, start_date, end_date, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours 
      FROM workday_schedules 
      ORDER BY type
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return res.json([]);
    }
    
    const schedules = result.rows.map(schedule => {
      return {
        id: schedule.id.toString(),
        type: schedule.type || "Standard",
        startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
        endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
        monday_hours: parseFloat(schedule.monday_hours) || 8,
        tuesday_hours: parseFloat(schedule.tuesday_hours) || 8,
        wednesday_hours: parseFloat(schedule.wednesday_hours) || 8,
        thursday_hours: parseFloat(schedule.thursday_hours) || 8,
        friday_hours: parseFloat(schedule.friday_hours) || 8,
        mondayHours: parseFloat(schedule.monday_hours) || 8,
        tuesdayHours: parseFloat(schedule.tuesday_hours) || 8,
        wednesdayHours: parseFloat(schedule.wednesday_hours) || 8,
        thursdayHours: parseFloat(schedule.thursday_hours) || 8,
        fridayHours: parseFloat(schedule.friday_hours) || 8,
        start_time: "08:00",
        end_time: "16:00",
        days_of_week: [1, 2, 3, 4, 5]
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
    const query = `
      SELECT id, type, start_date, end_date, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours 
      FROM workday_schedules 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workday schedule not found' });
    }
    
    const schedule = result.rows[0];
    
    const formattedSchedule = {
      id: schedule.id.toString(),
      type: schedule.type || "Standard",
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      monday_hours: parseFloat(schedule.monday_hours) || 8,
      tuesday_hours: parseFloat(schedule.tuesday_hours) || 8,
      wednesday_hours: parseFloat(schedule.wednesday_hours) || 8,
      thursday_hours: parseFloat(schedule.thursday_hours) || 8,
      friday_hours: parseFloat(schedule.friday_hours) || 8,
      mondayHours: parseFloat(schedule.monday_hours) || 8,
      tuesdayHours: parseFloat(schedule.tuesday_hours) || 8,
      wednesdayHours: parseFloat(schedule.wednesday_hours) || 8,
      thursdayHours: parseFloat(schedule.thursday_hours) || 8,
      fridayHours: parseFloat(schedule.friday_hours) || 8,
      start_time: "08:00",
      end_time: "16:00",
      days_of_week: [1, 2, 3, 4, 5]
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
      type,
      startDate,
      endDate,
      mondayHours,
      tuesdayHours,
      wednesdayHours,
      thursdayHours,
      fridayHours
    } = req.body;
    
    console.log('POST workday_schedules - Received data:', req.body);
    
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    // Ensure all values are properly handled
    const start_date = startDate || new Date().toISOString().split('T')[0];
    const end_date = endDate || new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
    
    // Parse number values and handle nulls
    const monday = parseFloat(mondayHours) || null;
    const tuesday = parseFloat(tuesdayHours) || null;
    const wednesday = parseFloat(wednesdayHours) || null;
    const thursday = parseFloat(thursdayHours) || null;
    const friday = parseFloat(fridayHours) || null;
    
    console.log('Processed values for DB insert:', { type, start_date, end_date, monday, tuesday, wednesday, thursday, friday });
    
    const idQuery = "SELECT MAX(id) as max_id FROM workday_schedules";
    const idResult = await pool.query(idQuery);
    const nextId = idResult.rows[0].max_id ? parseInt(idResult.rows[0].max_id) + 1 : 1;
    
    const query = `
      INSERT INTO workday_schedules 
      (id, type, start_date, end_date, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `;
    
    const values = [
      nextId,
      type,
      start_date,
      end_date,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday
    ];
    
    console.log('Executing query with values:', values);
    
    const result = await pool.query(query, values);
    const schedule = result.rows[0];
    
    const formattedSchedule = {
      id: schedule.id.toString(),
      type: schedule.type,
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      mondayHours: parseFloat(schedule.monday_hours) || null,
      tuesdayHours: parseFloat(schedule.tuesday_hours) || null,
      wednesdayHours: parseFloat(schedule.wednesday_hours) || null,
      thursdayHours: parseFloat(schedule.thursday_hours) || null,
      fridayHours: parseFloat(schedule.friday_hours) || null
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
      type,
      startDate,
      endDate,
      mondayHours,
      tuesdayHours,
      wednesdayHours,
      thursdayHours,
      fridayHours
    } = req.body;
    
    console.log(`PUT workday_schedules/${id} - Received data:`, req.body);
    
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    const start_date = startDate || new Date().toISOString().split('T')[0];
    const end_date = endDate || new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
    
    // Parse number values and handle nulls
    const monday = parseFloat(mondayHours) || null;
    const tuesday = parseFloat(tuesdayHours) || null;
    const wednesday = parseFloat(wednesdayHours) || null;
    const thursday = parseFloat(thursdayHours) || null;
    const friday = parseFloat(fridayHours) || null;
    
    console.log('Processed hours values for update:', { monday, tuesday, wednesday, thursday, friday });
    
    const query = `
      UPDATE workday_schedules 
      SET type = $1, start_date = $2, end_date = $3, monday_hours = $4, tuesday_hours = $5, 
          wednesday_hours = $6, thursday_hours = $7, friday_hours = $8
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      type,
      start_date,
      end_date,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      id
    ];
    
    console.log('Executing update query with values:', values);
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workday schedule not found' });
    }
    
    const schedule = result.rows[0];
    
    const formattedSchedule = {
      id: schedule.id.toString(),
      type: schedule.type,
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      mondayHours: parseFloat(schedule.monday_hours) || null,
      tuesdayHours: parseFloat(schedule.tuesday_hours) || null,
      wednesdayHours: parseFloat(schedule.wednesday_hours) || null,
      thursdayHours: parseFloat(schedule.thursday_hours) || null,
      fridayHours: parseFloat(schedule.friday_hours) || null
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
