import Game from '../models/Game.js';

export const getMyGames = async (req, res) => {
  try {
    const games = await Game.find({ userId: req.user._id }).sort({ startTime: -1 });
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game history' });
  }
};

export const getGameById = async (req, res) => {
  try {
    const game = await Game.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (game) {
      res.status(200).json(game);
    } else {
      res.status(404).json({ message: 'Game not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game details' });
  }
};