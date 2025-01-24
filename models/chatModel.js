const mongoose = require('mongoose');

// Define the schema for chat
const chatSchema = new mongoose.Schema(
  {
    userMessage: {
      type: String,
      required: true,
    },
    botResponse: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
