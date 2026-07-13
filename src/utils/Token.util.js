const jwt = require('jsonwebtoken');
const { CodedApiError } = require('./CodedApiError.util');

function generateToken(ownerId, role) {
  return jwt.sign({ ownerId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function generateRememberMeToken(ownerId, role) {
  return jwt.sign({ ownerId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN,
  });
}

function verifyToken(token) {
  if (!token) {
    throw new CodedApiError("TOKEN_REQUIRED", 'Token is required', 400);
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new CodedApiError("INVALID_TOKEN", 'Invalid token', 401);
  }
}

function decodeToken(token) {
  if (!token) {
    throw new CodedApiError("TOKEN_REQUIRED", 'Token is required', 400);
  }

  return jwt.decode(token);
}

function getExpirationDate(rememberMe = false) {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_ME_EXPIRES_IN
    : process.env.JWT_EXPIRES_IN;

  const match = /^(\d+)([dhms])$/.exec(expiresIn || '7d');
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };

  return new Date(Date.now() + value * multipliers[unit]);
}

function getUserRoleByToken(token) {
  const verifiedToken = verifyToken(token);

  if (!verifiedToken?.ownerId || !verifiedToken?.role) {
    throw new CodedApiError("INVALID_TOKEN", 'Invalid token', 401);
  }

  return verifiedToken.role;
}

module.exports = {
  generateToken,
  generateRememberMeToken,
  verifyToken,
  decodeToken,
  getExpirationDate,
  getUserRoleByToken,
};
