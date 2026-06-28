require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { authMiddleware, errorHandler, requestLogger } = require('./middleware/auth');
const connectDB = require('./config/database');
const logger = require('./config/logger');

// Route imports
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const eventRoutes = require('./routes/events');
const scanRoutes = require('./routes/scan');

const app = express();

// Security Middleware
app.use(helmet());

// CORS — support multiple origins (comma-separated in .env)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/scan', scanRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use(errorHandler);

// Initialize Server
const PORT = process.env.BACKEND_PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
