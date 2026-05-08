import express from 'express';
import { getMyGames, getGameById, createGame, deleteGame, resignGame } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-games', protect, getMyGames);
router.get('/:id', protect, getGameById);
router.post('/new', protect, createGame);
router.delete('/delete/:id', protect, deleteGame);
router.post('/resign', protect, resignGame);

export default router;