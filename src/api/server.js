
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import configuration
const corsOptions = require('./config/cors');

// Import route modules
const statusRoutes = require('./routes/status');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const timeEntryRoutes = require('./routes/time-entries');
const holidayRoutes = require('./routes/holidays');
const vacationDayRoutes = require('./routes/vacation-days');
const migrationRoutes = require('./routes/migration');
const passwordsRoutes = require('./routes/passwords');
const emailRoutes = require('./routes/email');
const workdayScheduleRoutes = require('./routes/workday-schedules');
const reviewConfigRoutes = require('./routes/review-config');
const dailyReviewRoutes = require('./routes/daily-review');

// Create Express application
const app = express();
const port = 3000;

// Configure middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Mount routes
app.use('/api', statusRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time_entries', timeEntryRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/vacation_days', vacationDayRoutes);
app.use('/api/migrate', migrationRoutes);
app.use('/api/passwords', passwordsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/workday_schedules', workdayScheduleRoutes);
app.use('/api/review_config', reviewConfigRoutes);
app.use('/api/daily_review', dailyReviewRoutes);

// Start server - listen on all interfaces, not just localhost
app.listen(port, '0.0.0.0', () => {
  console.log(`API server running at http://0.0.0.0:${port}/api`);
  console.log(`For remote access, make sure port ${port} is accessible and properly forwarded`);
  console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
});
