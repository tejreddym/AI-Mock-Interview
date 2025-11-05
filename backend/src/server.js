import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
