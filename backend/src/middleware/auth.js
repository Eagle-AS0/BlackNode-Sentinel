const { verifyToken } = require('../config/jwt');
const logger = require('../config/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
};

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
};

module.exports = {
  authMiddleware,
  errorHandler,
  requestLogger,
};
