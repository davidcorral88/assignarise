
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
    
    // Format the response to match the expected WorkdaySchedule type in the frontend
    const schedules = result.rows.map(schedule => {
      return {
        id: schedule.id.toString(),
        type: schedule.type || "Standard",
        startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
        endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
        // For database compatibility
        monday_hours: schedule.monday_hours || 8,
        tuesday_hours: schedule.tuesday_hours || 8,
        wednesday_hours: schedule.wednesday_hours || 8,
        thursday_hours: schedule.thursday_hours || 8,
        friday_hours: schedule.friday_hours || 8,
        // For frontend compatibility
        mondayHours: schedule.monday_hours || 8,
        tuesdayHours: schedule.tuesday_hours || 8,
        wednesdayHours: schedule.wednesday_hours || 8,
        thursdayHours: schedule.thursday_hours || 8,
        fridayHours: schedule.friday_hours || 8,
        // Required by interface but not used
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
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      type: schedule.type || "Standard",
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      // For database compatibility
      monday_hours: schedule.monday_hours || 8,
      tuesday_hours: schedule.tuesday_hours || 8,
      wednesday_hours: schedule.wednesday_hours || 8,
      thursday_hours: schedule.thursday_hours || 8,
      friday_hours: schedule.friday_hours || 8,
      // For frontend compatibility
      mondayHours: schedule.monday_hours || 8,
      tuesdayHours: schedule.tuesday_hours || 8,
      wednesdayHours: schedule.wednesday_hours || 8,
      thursdayHours: schedule.thursday_hours || 8,
      fridayHours: schedule.friday_hours || 8,
      // Required by interface but not used
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
    
    // Validate required fields
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    // Let PostgreSQL assign the ID automatically using SERIAL
    const query = `
      INSERT INTO workday_schedules 
      (type, start_date, end_date, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    
    const values = [
      type,
      startDate || null,
      endDate || null,
      mondayHours || 8,
      tuesdayHours || 8,
      wednesdayHours || 8,
      thursdayHours || 8,
      fridayHours || 7
    ];
    
    const result = await pool.query(query, values);
    const schedule = result.rows[0];
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      type: schedule.type,
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      mondayHours: schedule.monday_hours || 8,
      tuesdayHours: schedule.tuesday_hours || 8,
      wednesdayHours: schedule.wednesday_hours || 8,
      thursdayHours: schedule.thursday_hours || 8,
      fridayHours: schedule.friday_hours || 7,
      // Required by interface but not used
      start_time: "08:00",
      end_time: "16:00",
      days_of_week: [1, 2, 3, 4, 5]
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
    
    // Validate required fields
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    const query = `
      UPDATE workday_schedules 
      SET type = $1, start_date = $2, end_date = $3, monday_hours = $4, tuesday_hours = $5, 
          wednesday_hours = $6, thursday_hours = $7, friday_hours = $8
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      type,
      startDate || null,
      endDate || null,
      mondayHours || 8,
      tuesdayHours || 8,
      wednesdayHours || 8,
      thursdayHours || 8,
      fridayHours || 7,
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
      type: schedule.type,
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      mondayHours: schedule.monday_hours || 8,
      tuesdayHours: schedule.tuesday_hours || 8,
      wednesdayHours: schedule.wednesday_hours || 8,
      thursdayHours: schedule.thursday_hours || 8,
      fridayHours: schedule.friday_hours || 7,
      // Required by interface but not used
      start_time: "08:00",
      end_time: "16:00",
      days_of_week: [1, 2, 3, 4, 5]
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
