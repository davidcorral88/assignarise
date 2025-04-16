
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Path to store configuration
const TASK_REVIEW_CONFIG_PATH = path.join(__dirname, '../config/task-review-config.json');

// Start the task review scheduler
const startTaskReviewScheduler = () => {
  console.log('Starting task review scheduler...');
  
  // Run every minute to check if we need to run the task review
  cron.schedule('* * * * *', async () => {
    try {
      // Check if config file exists
      if (!fs.existsSync(TASK_REVIEW_CONFIG_PATH)) {
        return;
      }
      
      // Read configuration
      const fileContent = fs.readFileSync(TASK_REVIEW_CONFIG_PATH, 'utf8');
      const config = JSON.parse(fileContent);
      
      // Check if enabled
      if (!config.enabled) {
        return;
      }
      
      // Get current time in HH:MM format
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      // Check if it's time to run the review
      if (currentTime === config.reviewTime) {
        console.log('Running task review process...');
        
        // Trigger the review process
        const response = await fetch('http://localhost:3000/api/config/task-review/run', {
          method: 'POST'
        });
        
        const result = await response.json();
        console.log('Task review result:', result);
      }
    } catch (error) {
      console.error('Error in task review scheduler:', error);
    }
  });
  
  console.log('Task review scheduler started');
};

module.exports = {
  startTaskReviewScheduler
};
