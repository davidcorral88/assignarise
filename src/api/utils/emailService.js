
const nodemailer = require('nodemailer');

// Email configuration factory with multiple fallback options
const createEmailTransporter = (configIndex = 0) => {
  // Array of possible configurations to try
  const configurations = [
    // Configuration 1: Gmail with OAuth2 (most reliable)
    {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
        pass: process.env.EMAIL_PASS || 'pvgz mlke rrxw ttqb', // App password for Gmail
      },
      connectionTimeout: 10000, // Reduced timeout to 10 seconds for faster retries
      greetingTimeout: 5000,    // Reduced greeting timeout
      socketTimeout: 10000,     // Reduced socket timeout
      pool: false,              // Disable connection pooling to prevent hanging connections
      maxConnections: 1,        // Limit to one connection at a time
      maxMessages: 1            // Send only one message per connection
    },
    // Configuration 2: Gmail with STARTTLS on port 587
    {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
        pass: process.env.EMAIL_PASS || 'pvgz mlke rrxw ttqb', // App password for Gmail
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      pool: false,               // Disable connection pooling
      maxConnections: 1,         // Limit to one connection at a time
      maxMessages: 1             // Send only one message per connection
    },
    // Configuration 3: Original server as fallback
    {
      host: 'mail.temagc.com',
      port: 465,
      secure: true,
      auth: {
        user: 'atsxptpg_tecnoloxico@iplanmovilidad.com',
        pass: 'H4.4n0iKuxkA',
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      pool: false,               // Disable connection pooling
      maxConnections: 1,         // Limit to one connection at a time
      maxMessages: 1,            // Send only one message per connection
      tls: {
        rejectUnauthorized: false
      }
    }
  ];

  // Use the configuration at the specified index, or the first one if out of bounds
  const config = configIndex < configurations.length ? configurations[configIndex] : configurations[0];
  
  console.log('Trying email configuration #' + (configIndex + 1) + ':');
  console.log('- Host:', config.host || config.service);
  console.log('- Port:', config.port);
  console.log('- Secure:', config.secure);
  console.log('- User:', config.auth.user);
  console.log('- Connection Timeout:', config.connectionTimeout + 'ms');
  
  return nodemailer.createTransport(config);
};

// Create initial transporter with first configuration
let currentTransporter = createEmailTransporter(0);
let currentConfigIndex = 0;

// Function to try the next configuration
const tryNextConfiguration = () => {
  currentConfigIndex = (currentConfigIndex + 1) % 3; // Cycle through 3 configurations
  console.log(`Switching to email configuration #${currentConfigIndex + 1}`);
  
  // Explicitly close previous transporter if possible
  if (currentTransporter && typeof currentTransporter.close === 'function') {
    try {
      currentTransporter.close();
      console.log('Successfully closed previous email transport connection');
    } catch (error) {
      console.error('Error closing previous email transport:', error.message);
    }
  }
  
  return createEmailTransporter(currentConfigIndex);
};

// Enhanced send function with retry logic and configuration switching
const sendEmail = async (mailOptions, maxRetries = 2) => {
  let retries = 0;
  let lastError = null;
  let configurationAttempts = 0;
  const maxConfigAttempts = 3; // Try all 3 configurations
  
  // Log the destination address for troubleshooting
  console.log(`Attempting to send email to: ${mailOptions.to}`);
  if (mailOptions.cc) {
    console.log(`With CC to: ${mailOptions.cc}`);
  }

  while (configurationAttempts < maxConfigAttempts) {
    retries = 0; // Reset retries for each configuration
    
    while (retries < maxRetries) {
      try {
        console.log(`Attempt ${retries + 1} with configuration #${currentConfigIndex + 1} to send email to ${mailOptions.to}`);
        
        // Create a fresh transporter for each attempt to avoid stale connections
        const transporter = createEmailTransporter(currentConfigIndex);
        
        // Add logging info to help with debugging
        console.log(`Current email transport settings:`);
        console.log(`- Host: ${transporter.transporter.options.host || transporter.transporter.options.service}`);
        console.log(`- Port: ${transporter.transporter.options.port}`);
        console.log(`- Secure: ${transporter.transporter.options.secure}`);
        
        // Set a timeout for the entire email sending operation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Email sending timed out')), 15000);
        });
        
        // Race between the email sending and the timeout
        const result = await Promise.race([
          transporter.sendMail(mailOptions),
          timeoutPromise
        ]);
        
        // Close the transporter to release resources
        if (typeof transporter.close === 'function') {
          try {
            transporter.close();
            console.log('Successfully closed email transport connection');
          } catch (closeError) {
            console.error('Error closing email transport:', closeError.message);
          }
        }
        
        console.log(`Email sent successfully to ${mailOptions.to}:`, result.messageId);
        return result;
      } catch (error) {
        retries++;
        lastError = error;
        console.error(`Email sending attempt ${retries} with configuration #${currentConfigIndex + 1} failed: ${error.message}`);
        
        // Check for network connectivity issues
        const isNetworkError = error.code === 'ETIMEDOUT' || 
                              error.code === 'ECONNREFUSED' || 
                              error.code === 'ENOTFOUND' || 
                              error.code === 'ENETUNREACH' ||
                              error.message === 'Email sending timed out' ||
                              error.message.includes('timeout');
        
        if (isNetworkError) {
          console.log('Network connectivity issue detected. Trying next configuration immediately.');
          break; // Exit the retry loop for this config and try next one immediately
        }
        
        // Wait before retrying (shorter linear backoff)
        if (retries < maxRetries) {
          const waitTime = 1000 * retries; // 1s, 2s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If we've exhausted retries with current configuration, try the next one
    configurationAttempts++;
    if (configurationAttempts < maxConfigAttempts) {
      console.log(`All ${maxRetries} attempts with configuration #${currentConfigIndex + 1} failed. Trying next configuration...`);
      currentTransporter = tryNextConfiguration();
    }
  }

  // If all configurations failed, log and gracefully degrade
  console.error(`Failed to send email to ${mailOptions.to} after trying all configurations.`);
  const errorMessage = `Failed to send email after exhausting all options: ${lastError?.message}`;
  
  // Log the failure but don't throw - return failure status instead
  return {
    success: false,
    error: errorMessage,
    message: 'Email delivery failed due to connectivity issues. The system will continue to operate.'
  };
};

// Test mail service connection during startup
const testMailService = async () => {
  console.log('Testing mail service connectivity...');
  
  for (let configIndex = 0; configIndex < 3; configIndex++) {
    try {
      const transporter = createEmailTransporter(configIndex);
      await transporter.verify();
      console.log(`✓ Mail configuration #${configIndex + 1} verified successfully!`);
      
      // Close the connection
      if (typeof transporter.close === 'function') {
        try {
          transporter.close();
        } catch (closeError) {
          console.error(`Error closing test connection for config #${configIndex + 1}:`, closeError.message);
        }
      }
      
      return transporter; // Return the working transporter
    } catch (error) {
      console.error(`✗ Mail configuration #${configIndex + 1} failed verification:`, error.message);
    }
  }
  
  console.warn('No mail configurations could be verified. Email functionality may be limited.');
  return null;
};

// Function to test email connectivity
const testEmailConnectivity = async () => {
  try {
    const testMailOptions = {
      from: process.env.EMAIL_USER || '"Sistema de Tarefas" <notificacions@iplanmovilidad.com>',
      to: process.env.EMAIL_USER || 'iplanmovilidad@gmail.com',
      subject: 'Test Email Connection',
      text: 'This is a test email to verify the email server connection is working.',
      html: '<p>This is a test email to verify the email server connection is working.</p>'
    };
    
    const result = await sendEmail(testMailOptions, 1);
    return result;
  } catch (error) {
    console.error('Email connectivity test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test mail service during startup
testMailService().then(transporter => {
  if (transporter) {
    currentTransporter = transporter;
    console.log('Using mail configuration that passed connectivity test');
  }
});

module.exports = {
  sendEmail,
  createEmailTransporter,
  tryNextConfiguration,
  testEmailConnectivity,
  testMailService
};
