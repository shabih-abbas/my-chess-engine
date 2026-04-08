import mongoose from 'mongoose';

const analysisSessionSchema = new mongoose.Schema({
  analysisId: {
    type: String,
    required: true,
    unique: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  }
}, {
  timestamps: true
});

const AnalysisSession = mongoose.model('AnalysisSession', analysisSessionSchema);
export default AnalysisSession;