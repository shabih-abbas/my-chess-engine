import express from 'express';
import { getMyGames, getGameById } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-games', protect, getMyGames);
router.get('/:id', protect, getGameById);

export default router;