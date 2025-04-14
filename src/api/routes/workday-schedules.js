
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
        mondayHours: Number(schedule.monday_hours) || 8,
        tuesdayHours: Number(schedule.tuesday_hours) || 8,
        wednesdayHours: Number(schedule.wednesday_hours) || 8,
        thursdayHours: Number(schedule.thursday_hours) || 8,
        fridayHours: Number(schedule.friday_hours) || 8,
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
      mondayHours: Number(schedule.monday_hours) || 8,
      tuesdayHours: Number(schedule.tuesday_hours) || 8,
      wednesdayHours: Number(schedule.wednesday_hours) || 8,
      thursdayHours: Number(schedule.thursday_hours) || 8,
      fridayHours: Number(schedule.friday_hours) || 8,
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
    
    console.log('POST workday_schedules - Received data:', req.body);
    
    // Validate required fields
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    // Make sure start_date is never null by providing a default value (today's date)
    const start_date = startDate || new Date().toISOString().split('T')[0];
    // Make sure end_date is never null by providing a default value (end of year)
    const end_date = endDate || new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
    
    // Ensure all values are properly parsed as floating-point numbers
    const monday = mondayHours !== undefined ? parseFloat(mondayHours) : 8;
    const tuesday = tuesdayHours !== undefined ? parseFloat(tuesdayHours) : 8;
    const wednesday = wednesdayHours !== undefined ? parseFloat(wednesdayHours) : 8;
    const thursday = thursdayHours !== undefined ? parseFloat(thursdayHours) : 8;
    const friday = fridayHours !== undefined ? parseFloat(fridayHours) : 7;
    
    console.log('Processed hours values:', { monday, tuesday, wednesday, thursday, friday });
    
    // First get the next ID
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
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      type: schedule.type,
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      mondayHours: parseFloat(schedule.monday_hours),
      tuesdayHours: parseFloat(schedule.tuesday_hours),
      wednesdayHours: parseFloat(schedule.wednesday_hours),
      thursdayHours: parseFloat(schedule.thursday_hours),
      fridayHours: parseFloat(schedule.friday_hours),
      // Required by interface but not used
      start_time: "08:00",
      end_time: "16:00",
      days_of_week: [1, 2, 3, 4, 5]
    };
    
    console.log('Returning formatted schedule:', formattedSchedule);
    
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
    
    // Validate required fields
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    // Make sure start_date is never null by providing a default value (today's date)
    const start_date = startDate || new Date().toISOString().split('T')[0];
    // Make sure end_date is never null by providing a default value (end of year)
    const end_date = endDate || new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
    
    // Ensure all values are properly parsed as floating-point numbers
    const monday = mondayHours !== undefined ? parseFloat(mondayHours) : 8;
    const tuesday = tuesdayHours !== undefined ? parseFloat(tuesdayHours) : 8;
    const wednesday = wednesdayHours !== undefined ? parseFloat(wednesdayHours) : 8;
    const thursday = thursdayHours !== undefined ? parseFloat(thursdayHours) : 8;
    const friday = fridayHours !== undefined ? parseFloat(fridayHours) : 7;
    
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
    
    // Format the response to match the expected WorkdaySchedule type
    const formattedSchedule = {
      id: schedule.id.toString(),
      type: schedule.type,
      startDate: schedule.start_date ? new Date(schedule.start_date).toISOString().split('T')[0] : null,
      endDate: schedule.end_date ? new Date(schedule.end_date).toISOString().split('T')[0] : null,
      mondayHours: parseFloat(schedule.monday_hours),
      tuesdayHours: parseFloat(schedule.tuesday_hours),
      wednesdayHours: parseFloat(schedule.wednesday_hours),
      thursdayHours: parseFloat(schedule.thursday_hours),
      fridayHours: parseFloat(schedule.friday_hours),
      // Required by interface but not used
      start_time: "08:00",
      end_time: "16:00",
      days_of_week: [1, 2, 3, 4, 5]
    };
    
    console.log('Returning updated formatted schedule:', formattedSchedule);
    
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
