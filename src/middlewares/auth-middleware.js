const { verifyToken } = require('../utils/Token.util');
const authTokenService = require('../services/auth-token-service');

async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 401, message: 'Unauthorized' });
  }

  try {
    const storedToken = await authTokenService.findToken(token);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }

    const verifiedToken = verifyToken(token);
    req.user = verifiedToken;
    req.authToken = storedToken;

    return next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: 'Unauthorized' });
  }
}

module.exports = { authenticateToken };
