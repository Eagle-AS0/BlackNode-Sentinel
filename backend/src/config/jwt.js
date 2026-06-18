const jwt = require('jsonwebtoken');
const logger = require('./logger');

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  } catch (error) {
    logger.error(`JWT generation error: ${error.message}`);
    throw error;
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error(`JWT verification error: ${error.message}`);
    throw error;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error(`JWT decode error: ${error.message}`);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
