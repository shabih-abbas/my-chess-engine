import Game from '../models/Game.js';
import {Chess} from 'chess.js';

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

export const createGame = async (req, res) => {
    try {
        const { playerColor, opening } = req.body;
        const userId = req.user._id; 

        if (!['white', 'black'].includes(playerColor)) {
            return res.status(400).json({ message: "Invalid player color" });
        }

        const chess = new Chess();
        const initialFen = chess.fen();

        const newGame = new Game({
            userId,
            playerColor,
            opening: opening || "Standard",
            currentFen: initialFen,
            status: 'in-progress',
            moves: []
        });

        const savedGame = await newGame.save();

        res.status(201).json({
            message: "Game initialized successfully",
            gameId: savedGame._id
        });

    } catch (error) {
        console.error("Error creating game:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};