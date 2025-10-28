const express = require('express');
const router = express.Router();
const llmController = require('../llmController');

router.post('events/chatbot/:message', llmController.getChatbotOutput);

module.exports = router;