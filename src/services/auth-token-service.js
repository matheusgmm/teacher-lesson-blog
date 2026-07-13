const authTokenRepository = require('../repositories/auth-token-repository');
const { CodedApiError } = require('../utils/CodedApiError.util');
const { verifyToken } = require('../utils/Token.util');

async function findToken(token) {
  if (!token) {
    throw new CodedApiError("TOKEN_REQUIRED", 'Token is required', 400);
  }

  return authTokenRepository.findToken(token);
}

async function createToken(data) {
  if (!data.ownerId || !data.role) {
    throw new CodedApiError("OWNER_ID_REQUIRED", 'Owner id and role are required', 400);
  }

  return authTokenRepository.createAuthToken(data);
}

async function deleteToken(token) {
  if (!token) {
    throw new CodedApiError("TOKEN_REQUIRED", 'Token is required', 400);
  }

  const cleanToken = token.trim();

  verifyToken(cleanToken);

  const storedToken = await authTokenRepository.findToken(cleanToken);

  if (!storedToken) {
    throw new CodedApiError("TOKEN_NOT_FOUND_OR_REVOKED", 'Token not found or already revoked', 401);
  }

  if (storedToken.expiresAt < new Date()) {
    await authTokenRepository.deleteAuthToken(cleanToken);
    throw new CodedApiError("TOKEN_EXPIRED", 'Token expired', 401);
  }

  return authTokenRepository.deleteAuthToken(cleanToken);
}

module.exports = { findToken, createToken, deleteToken };
