const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');

// Route for handling chat
router.post('/', handleChat);

module.exports = router;
