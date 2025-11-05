import express from 'express';
import {
  createInterview,
  generateQuestions,
  submitAnswer,
  evaluateAnswer,
  completeInterview,
  getUserInterviews,
  getInterview,
  getUserStats
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';
import { interviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Apply interview rate limiter to all routes
router.use(interviewLimiter);

router.get('/stats', getUserStats);
router.get('/', getUserInterviews);
router.post('/', createInterview);
router.get('/:interviewId', getInterview);
router.post('/:interviewId/generate', generateQuestions);
router.post('/:interviewId/questions/:questionIndex/answer', submitAnswer);
router.post('/:interviewId/questions/:questionIndex/evaluate', evaluateAnswer);
router.put('/:interviewId/complete', completeInterview);

export default router;
