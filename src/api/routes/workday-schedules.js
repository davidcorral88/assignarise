
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all workday schedules
router.get('/', async (req, res) => {
  try {
    // Instead of selecting by name (which doesn't exist), group schedules by type
    // We'll create a new structure that groups records by type for the frontend
    const query = `
      SELECT id, type, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours 
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
        name: schedule.type || "Standard", // Use type as name since we don't have a name column
        type: schedule.type || "Standard",
        monday_hours: schedule.monday_hours || 8,
        tuesday_hours: schedule.tuesday_hours || 8,
        wednesday_hours: schedule.wednesday_hours || 8,
        thursday_hours: schedule.thursday_hours || 8,
        friday_hours: schedule.friday_hours || 7,
        // For frontend compatibility
        mondayHours: schedule.monday_hours || 8,
        tuesdayHours: schedule.tuesday_hours || 8,
        wednesdayHours: schedule.wednesday_hours || 8,
        thursdayHours: schedule.thursday_hours || 8,
        fridayHours: schedule.friday_hours || 7
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
      SELECT id, type, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours 
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
      name: schedule.type || "Standard", // Use type as name
      type: schedule.type || "Standard",
      monday_hours: schedule.monday_hours || 8,
      tuesday_hours: schedule.tuesday_hours || 8,
      wednesday_hours: schedule.wednesday_hours || 8,
      thursday_hours: schedule.thursday_hours || 8,
      friday_hours: schedule.friday_hours || 7,
      // For frontend compatibility
      mondayHours: schedule.monday_hours || 8,
      tuesdayHours: schedule.tuesday_hours || 8,
      wednesdayHours: schedule.wednesday_hours || 8,
      thursdayHours: schedule.thursday_hours || 8,
      fridayHours: schedule.friday_hours || 7
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
      INSERT INTO workday_schedules 
      (type, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const values = [
      type,
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
      name: schedule.type, // Use type as name
      type: schedule.type,
      mondayHours: schedule.monday_hours || 8,
      tuesdayHours: schedule.tuesday_hours || 8,
      wednesdayHours: schedule.wednesday_hours || 8,
      thursdayHours: schedule.thursday_hours || 8,
      fridayHours: schedule.friday_hours || 7
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
      SET type = $1, monday_hours = $2, tuesday_hours = $3, wednesday_hours = $4,
          thursday_hours = $5, friday_hours = $6
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      type,
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
      name: schedule.type, // Use type as name
      type: schedule.type,
      mondayHours: schedule.monday_hours || 8,
      tuesdayHours: schedule.tuesday_hours || 8,
      wednesdayHours: schedule.wednesday_hours || 8,
      thursdayHours: schedule.thursday_hours || 8,
      fridayHours: schedule.friday_hours || 7
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
