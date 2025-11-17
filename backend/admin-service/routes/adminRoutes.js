import express from 'express';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.post('/events', adminController.addEvent);

export default router;
