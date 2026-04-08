import mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnalysisSession',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  moveNumber: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  annotationType: {
    type: String,
    enum: ['blunder', 'mistake', 'brilliant', 'best', 'inaccuracy', 'commentary'],
    default: 'commentary'
  }
}, {
  timestamps: true
});

const Annotation = mongoose.model('Annotation', annotationSchema);
export default Annotation;