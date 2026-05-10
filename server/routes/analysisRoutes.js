import express from 'express';
import { getOrCreateSession } from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/get', protect, getOrCreateSession);

export default router;