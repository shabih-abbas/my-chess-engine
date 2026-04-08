import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
  moveNumber: {
    type: Number,
    required: true
  },
  fromSquare: {
    type: String,
    required: true
  },
  toSquare: {
    type: String,
    required: true
  },
  piece: {
    type: String,
    required: true
  },
  notation: {
    type: String,
    required: true
  }
}, { _id: false });

const gameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playerColor: {
    type: String,
    enum: ['white', 'black'],
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'draw', 'in-progress'],
    default: 'in-progress'
  },
  moves: [moveSchema]
}, {
  timestamps: true
});

const Game = mongoose.model('Game', gameSchema);
export default Game;