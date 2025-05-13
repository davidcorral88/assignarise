
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
      connectionTimeout: 30000, // 30 seconds connection timeout
      greetingTimeout: 15000,   // 15 seconds for SMTP greeting
      socketTimeout: 30000,     // 30 seconds socket timeout
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
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
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
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
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
  return createEmailTransporter(currentConfigIndex);
};

// Enhanced send function with retry logic and configuration switching
const sendEmail = async (mailOptions, maxRetries = 3) => {
  let retries = 0;
  let lastError = null;
  let configurationAttempts = 0;
  const maxConfigAttempts = 3; // Try all 3 configurations

  while (configurationAttempts < maxConfigAttempts) {
    retries = 0; // Reset retries for each configuration
    
    while (retries < maxRetries) {
      try {
        console.log(`Attempt ${retries + 1} with configuration #${currentConfigIndex + 1} to send email to ${mailOptions.to}`);
        
        // Add logging info to help with debugging
        console.log(`Current email transport settings:`);
        console.log(`- Host: ${currentTransporter.transporter.options.host || currentTransporter.transporter.options.service}`);
        console.log(`- Port: ${currentTransporter.transporter.options.port}`);
        console.log(`- Secure: ${currentTransporter.transporter.options.secure}`);
        
        const result = await currentTransporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${mailOptions.to}:`, result.messageId);
        return result;
      } catch (error) {
        retries++;
        lastError = error;
        console.error(`Email sending attempt ${retries} with configuration #${currentConfigIndex + 1} failed:`, error.message);
        
        // Wait before retrying (linear backoff)
        if (retries < maxRetries) {
          const waitTime = 2000 * retries; // 2s, 4s, 6s
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

  console.error(`Failed to send email to ${mailOptions.to} after trying all configurations.`);
  throw new Error(`Failed to send email after exhausting all options: ${lastError?.message}`);
};

module.exports = {
  sendEmail,
  createEmailTransporter,
  tryNextConfiguration
};
