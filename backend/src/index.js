require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
const monitorRoutes = require('./routes/monitor');
const threatIntelRoutes = require('./routes/threatIntel');
const networkMonitorRoutes = require('./routes/networkMonitor');

const app = express();
const server = http.createServer(app);

// Socket.io for real-time updates
const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001').split(',').map(o => o.trim()),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Track connected clients
let connectedClients = 0;
io.on('connection', (socket) => {
  connectedClients++;
  logger.info(`[WS] Client connected (${connectedClients} total): ${socket.id}`);
  socket.on('disconnect', () => {
    connectedClients--;
    logger.info(`[WS] Client disconnected (${connectedClients} total): ${socket.id}`);
  });
});

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      cb(null, true);
    } else {
      cb(null, true); // Allow all in dev
    }
  },
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), wsClients: connectedClients });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/threat-intel', threatIntelRoutes);
app.use('/api/network', networkMonitorRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use(errorHandler);

// Initialize Server
const PORT = process.env.BACKEND_PORT || 5004;

const startServer = async () => {
  try {
    await connectDB();

    // Start threat intel background poller
    const ThreatIntelService = require('./services/threatIntelService');
    const threatIntel = new ThreatIntelService(io);
    threatIntel.startPolling();

    server.listen(PORT, () => {
      logger.info(`🛡️  BlackNode Sentinel backend running on port ${PORT}`);
      logger.info(`📡 WebSocket server ready`);
      logger.info(`🔍 Threat Intel poller started`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
