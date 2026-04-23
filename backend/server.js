const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Adds important HTTP security headers automatically
app.use(helmet());

// Allow frontend to talk to backend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// ============================================
// RATE LIMITING
// ============================================

// Strict limiter for auth routes — max 10 requests per 15 minutes
// Prevents brute force password attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General limiter for all other routes — max 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general limiter to everything
app.use(generalLimiter);

// Apply strict limiter to auth only
app.use('/api/auth', authLimiter);

// ============================================
// ROUTES
// ============================================
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/seller',   require('./routes/seller'));
app.use('/api/buyer',    require('./routes/buyer'));
app.use('/api/products', require('./routes/products'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/payment',  require('./routes/payment'));

// Health check
app.get('/', (req, res) => res.json({ message: 'ShopHub API is running' }));

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
// This catches any error thrown anywhere in the app
// and returns a clean response instead of crashing
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on our end';

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development, never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler — for routes that don't exist
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));