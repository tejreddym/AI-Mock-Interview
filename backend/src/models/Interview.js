import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  answeredAt: {
    type: Date
  }
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'senior'],
    required: true
  },
  interviewType: {
    type: String,
    enum: ['technical', 'behavioral', 'mixed'],
    default: 'mixed'
  },
  questions: [questionSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Calculate scores before saving
interviewSchema.pre('save', function(next) {
  if (this.questions.length > 0) {
    const answeredQuestions = this.questions.filter(q => q.score > 0);
    if (answeredQuestions.length > 0) {
      this.totalScore = answeredQuestions.reduce((sum, q) => sum + q.score, 0);
      this.averageScore = this.totalScore / answeredQuestions.length;
    }
  }
  next();
});

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
