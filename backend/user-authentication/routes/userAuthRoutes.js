const express = require('express');
const router = express.Router();
const authController = require('../controllers/userAuthController');

router.get('/events/register', authController.registerNewAccount);
router.get('/events/login', authController.loginAccount);

module.exports = router;