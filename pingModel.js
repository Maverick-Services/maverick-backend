const axios = require('axios');
const schedule = require('node-schedule');

// Function to ping the ML model
const pingModel = async () => {
  try {
    const response = await axios.get('https://maverick-ml-model.onrender.com/api/ping');
    console.log('Pinged ML model successfully:', response.status);
  } catch (error) {
    console.error('Error pinging ML model:', error.message);
  }
};

// Schedule a ping every 5 minutes
schedule.scheduleJob('*/5 * * * *', pingModel);

module.exports = pingModel;
