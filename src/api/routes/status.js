
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// API status endpoint
router.get('/status', async (req, res) => {
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
router.get('/', (req, res) => {
  res.redirect('/api/status');
});

module.exports = router;
