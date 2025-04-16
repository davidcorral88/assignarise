
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const pool = require('../db/connection');

// Path to store configuration
const CONFIG_DIR = path.join(__dirname, '../config');
const TASK_REVIEW_CONFIG_PATH = path.join(CONFIG_DIR, 'task-review-config.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Default configuration
const DEFAULT_CONFIG = {
  enabled: false,
  reviewTime: '08:00',
  notificationEmails: []
};

// Helper to read configuration
const readTaskReviewConfig = () => {
  try {
    if (fs.existsSync(TASK_REVIEW_CONFIG_PATH)) {
      const fileContent = fs.readFileSync(TASK_REVIEW_CONFIG_PATH, 'utf8');
      return JSON.parse(fileContent);
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error reading task review config:', error);
    return DEFAULT_CONFIG;
  }
};

// Helper to write configuration
const writeTaskReviewConfig = (config) => {
  try {
    fs.writeFileSync(TASK_REVIEW_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing task review config:', error);
    return false;
  }
};

// Get task review configuration
router.get('/task-review', (req, res) => {
  const config = readTaskReviewConfig();
  res.json(config);
});

// Update task review configuration
router.post('/task-review', (req, res) => {
  try {
    const { enabled, reviewTime, notificationEmails } = req.body;
    
    // Validate the data
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }
    
    if (!reviewTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(reviewTime)) {
      return res.status(400).json({ error: 'reviewTime must be in HH:MM format' });
    }
    
    if (!Array.isArray(notificationEmails)) {
      return res.status(400).json({ error: 'notificationEmails must be an array' });
    }
    
    const config = {
      enabled,
      reviewTime,
      notificationEmails,
      lastUpdated: new Date().toISOString()
    };
    
    const success = writeTaskReviewConfig(config);
    
    if (success) {
      res.json({ success: true, config });
    } else {
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  } catch (error) {
    console.error('Error updating task review config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check if a date is a weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

// Helper function to check if a date is a holiday
const isHoliday = async (date) => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const result = await pool.query('SELECT * FROM holidays WHERE date = $1', [formattedDate]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking holiday:', error);
    return false;
  }
};

// Helper to send email notifications
const sendEmailNotification = async (userData, missingHours, requiredHours, date, ccEmails) => {
  try {
    // This is a placeholder - in a real implementation, you would use your email sending logic
    console.log(`Sending email to ${userData.email}`);
    console.log(`Subject: Revisión diaria de tarefas - Horas non imputadas`);
    console.log(`Body: Estimado/a ${userData.name}, faltan ${missingHours} horas por imputar de ${requiredHours} requeridas para o día ${format(date, 'dd/MM/yyyy')}`);
    console.log(`CC: ${ccEmails.join(', ')}`);
    
    // If you have an email route, you could use something like this:
    /*
    const response = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userData.email,
        cc: ccEmails,
        subject: `Revisión diaria de tarefas - Horas non imputadas (${format(date, 'dd/MM/yyyy')})`,
        text: `Estimado/a ${userData.name},\n\nFaltan ${missingHours} horas por imputar de ${requiredHours} requeridas para o día ${format(date, 'dd/MM/yyyy')}.\n\nSaúdos,\nSistema de Control de Tarefas`,
        html: `<p>Estimado/a ${userData.name},</p><p>Faltan <strong>${missingHours}</strong> horas por imputar de ${requiredHours} requeridas para o día ${format(date, 'dd/MM/yyyy')}.</p><p>Saúdos,<br>Sistema de Control de Tarefas</p>`
      })
    });
    return response.ok;
    */
    
    return true; // Placeholder success
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Endpoint to manually trigger the review process
router.post('/task-review/run', async (req, res) => {
  try {
    const config = readTaskReviewConfig();
    
    // Check if review is enabled
    if (!config.enabled) {
      return res.status(400).json({ error: 'Task review is not enabled' });
    }
    
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    // Check if yesterday was a weekend or holiday
    if (isWeekend(yesterday) || await isHoliday(yesterday)) {
      return res.json({
        success: true,
        message: 'Yesterday was a weekend or holiday. No review needed.',
        date: format(yesterday, 'yyyy-MM-dd')
      });
    }
    
    // Format date for queries
    const formattedDate = format(yesterday, 'yyyy-MM-dd');
    
    // Get all workers from iPlan organization with email_notification = 'S'
    const usersResult = await pool.query(`
      SELECT * FROM users 
      WHERE organization = 'iPlan' 
      AND email_notification = true
    `);
    
    const users = usersResult.rows;
    const reviewResults = [];
    
    // Process each user
    for (const user of users) {
      // Get required hours for the day from workday schedules
      // This is a placeholder - you need to implement the actual logic to get required hours
      const requiredHours = 8; // Default to 8 hours
      
      // Get hours logged for yesterday
      const timeEntriesResult = await pool.query(
        'SELECT SUM(hours) as total_hours FROM time_entries WHERE user_id = $1 AND date = $2',
        [user.id, formattedDate]
      );
      
      const loggedHours = parseFloat(timeEntriesResult.rows[0]?.total_hours || 0);
      
      // Check if hours are insufficient
      if (loggedHours < requiredHours) {
        const missingHours = requiredHours - loggedHours;
        
        // Send notification
        await sendEmailNotification(
          user,
          missingHours,
          requiredHours,
          yesterday,
          config.notificationEmails
        );
        
        reviewResults.push({
          userId: user.id,
          userName: user.name,
          date: formattedDate,
          requiredHours,
          loggedHours,
          missingHours,
          notificationSent: true
        });
      } else {
        reviewResults.push({
          userId: user.id,
          userName: user.name,
          date: formattedDate,
          requiredHours,
          loggedHours,
          missingHours: 0,
          notificationSent: false
        });
      }
    }
    
    res.json({
      success: true,
      date: formattedDate,
      results: reviewResults
    });
  } catch (error) {
    console.error('Error running task review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
