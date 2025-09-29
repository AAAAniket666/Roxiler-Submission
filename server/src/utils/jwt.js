const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'store-rating-platform',
      audience: 'store-rating-users',
    }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'store-rating-platform',
      audience: 'store-rating-users',
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
};