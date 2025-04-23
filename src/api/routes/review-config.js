
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Obtener la configuración de revisión
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM review_config ORDER BY id DESC LIMIT 1');
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        config: {
          enabled: result.rows[0].enabled,
          reviewTime: result.rows[0].review_time,
          notificationEmails: result.rows[0].notification_emails
        }
      });
    } else {
      res.json({
        success: true,
        config: {
          enabled: 'N',
          reviewTime: '09:00',
          notificationEmails: ''
        }
      });
    }
  } catch (error) {
    console.error('Error al obtener la configuración de revisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración de revisión'
    });
  }
});

// Guardar la configuración de revisión
router.post('/', async (req, res) => {
  const { enabled, reviewTime, notificationEmails } = req.body;
  
  try {
    // Actualizar la configuración existente o insertar una nueva
    const result = await pool.query(
      `INSERT INTO review_config (enabled, review_time, notification_emails, updated_at) 
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE 
       SET enabled = $1, review_time = $2, notification_emails = $3, updated_at = NOW()
       RETURNING *`,
      [enabled, reviewTime, notificationEmails]
    );
    
    res.json({
      success: true,
      config: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar la configuración de revisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar la configuración de revisión'
    });
  }
});

module.exports = router;
