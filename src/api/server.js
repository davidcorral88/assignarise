const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Define allowed origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://corral-iplan.gal'];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Enable CORS
app.use(cors(corsOptions));

// Enable Helmet for security headers
app.use(helmet());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable JSON parsing
app.use(express.json());

// Enable URL-encoded parsing
app.use(express.urlencoded({ extended: true }));

// Log each request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Import routes
const statusRoutes = require('./routes/status');
const usersRoutes = require('./routes/users');
const tasksRoutes = require('./routes/tasks');
const timeEntriesRoutes = require('./routes/time-entries');
const holidaysRoutes = require('./routes/holidays');
const passwordsRoutes = require('./routes/passwords');
const vacationDaysRoutes = require('./routes/vacation-days');
const workdaySchedulesRoutes = require('./routes/workday-schedules');
const emailRoutes = require('./routes/email');
const migrationRoutes = require('./routes/migration');
const configRoutes = require('./routes/config'); // Add this line

// Apply routes
app.use('/api', statusRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/time-entries', timeEntriesRoutes);
app.use('/api/holidays', holidaysRoutes);
app.use('/api/passwords', passwordsRoutes);
app.use('/api/vacation-days', vacationDaysRoutes);
app.use('/api/workday-schedules', workdaySchedulesRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/config', configRoutes); // Add this line

// Handle invalid routes
app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist. Go to /api/status to check the API status.");
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Import scheduler service
const { startTaskReviewScheduler } = require('./services/scheduler');

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`API server running at http://${HOST}:${PORT}/api`);
  console.log(`For remote access, make sure port ${PORT} is accessible and properly forwarded`);
  console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
  
  // Start the task review scheduler
  startTaskReviewScheduler();
});
