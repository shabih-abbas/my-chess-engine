import mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnalysisSession',
    required: true
  },
  moveNumber: {
    type: Number,
    required: true
  },
  eval: {
    type: Number, 
    required: true
  },
  bestLine: {
    type: [String], 
    default: []
  },
  annotationType: {
    type: String,
    enum: ['best', 'book', 'good', 'inaccuracy', 'mistake', 'blunder'],
    default: 'good'
  },
  comment: {
    type: String
  }
}, { timestamps: true });

const Annotation = mongoose.model('Annotation', annotationSchema);
export default Annotation;