const axios = require('axios'); // Import axios for making HTTP requests
const Chat = require('../models/chatModel'); // Import the chat model

// Configuration for retries and delays
const RETRY_COUNT = process.env.RETRY_COUNT || 3; // Default: 3 retries
const RETRY_DELAY = process.env.RETRY_DELAY || 1000; // Default: 1 second delay

// Circuit breaker state
let circuitBreaker = false;

// Retry function with exponential backoff and circuit breaker
const retryAxios = async (url, data, retries = RETRY_COUNT, delay = RETRY_DELAY) => {
  if (circuitBreaker) throw new Error('Service unavailable (Circuit breaker triggered)');

  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data, { timeout: 30000 }); 
    } catch (error) {
      console.warn(`Retry ${i + 1}/${retries} failed:`, error.message);
      if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      else {
        // Trigger circuit breaker on final failure
        circuitBreaker = true;
        setTimeout(() => (circuitBreaker = false), 60000); // Reset circuit breaker after 60 seconds
        throw error;
      }
    }
  }
};

// Controller for handling chat
exports.handleChat = async (req, res) => {
  const { message } = req.body;

  // Validate incoming message
  if (!message || message.trim() === '' || message.length > 500) {
    return res.status(400).json({ error: 'Invalid or empty message' });
  }

  try {
    // Retry the ML model request if it fails
    const response = await retryAxios('https://maverick-ml-model.onrender.com/api/chat', { message });

    // Extract the bot's response
    const botResponse = response.data.botResponse || "Sorry, I couldn't understand that.";

    // Save the interaction only if it was initiated by the user
    if (message.trim() !== "") {
      const newChat = new Chat({
        userMessage: message,
        botResponse: botResponse,
      });

      // Save the chat to the database
      // await newChat.save();
    }

    // Send the response back to the frontend
    return res.status(200).json({ userMessage: message, botResponse });
  } catch (error) {
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out:', error.message);
      return res.status(504).json({ error: 'Request timed out. Please try again.' });
    } else if (error.response) {
      console.error('API responded with an error:', error.response.data);
      return res.status(error.response.status).json({ error: error.response.data || 'ML model error' });
    } else {
      console.error('Error communicating with ML model:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

// Health check function for the ML model
const checkMLHealth = async () => {
  try {
    const health = await axios.get('https://maverick-ml-model.onrender.com/api/ping');
    console.log('ML model is healthy:', health.status);
  } catch (error) {
    console.error('ML model health check failed:', error.message);
  }
};
// Run health check every minute
setInterval(checkMLHealth, 60000);




// const axios = require('axios'); // Import axios for making HTTP requests
// const Chat = require('../models/chatModel'); // Import the chat model

// // Controller for handling chat
// exports.handleChat = async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ error: 'Message is required' });
//   }

//   try {
//     // Make a request to the custom ML model API to get a response
//     const response = await axios.post('https://maverick-ml-model.onrender.com/api/chat', { message });

//     // Extract the bot's response from the API
//     const botResponse = response.data.botResponse || "Sorry, I couldn't understand that.";

//     // Save the interaction only if it was initiated by the user
//     if (message.trim() !== "") {
//       const newChat = new Chat({
//         userMessage: message,
//         botResponse: botResponse,
//       });

//       // await newChat.save();
//     }

//     // Send the response back to the frontend
//     return res.status(200).json({ userMessage: message, botResponse });
//   } catch (error) {
//     console.error('Error processing chat:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
