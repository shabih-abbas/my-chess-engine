import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
  moveNumber: {
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: { 
    type: String,
    required: true
  },
  piece: {
    type: String,
    required: true
  },
  promotion: {
    type: String,
    default: ''
  },
  notation: {
    type: String,
    required: true
  },
  fenAfter: {
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
  opening: { 
    type: String,
    default: 'Standard'
  },
  currentFen: { 
    type: String,
    default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  },
  status: { 
    type: String,
    enum: ['in-progress', 'completed', 'aborted', 'resigned'],
    default: 'in-progress'
  },
  result: { 
    type: String,
    enum: ['white', 'black', 'draw', null],
    default: null
  },
  moves: [moveSchema],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});
const Game = mongoose.model('Game', gameSchema);
export default Game;