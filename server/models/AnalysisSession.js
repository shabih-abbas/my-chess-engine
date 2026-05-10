import mongoose from 'mongoose';

const analysisSessionSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  engineDepth: {
    type: Number,
    default: 10 
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  }
}, { timestamps: true });

const AnalysisSession = mongoose.model('AnalysisSession', analysisSessionSchema);
export default AnalysisSession;