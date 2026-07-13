const { prisma } = require('../config/prisma');
const {
  generateToken,
  generateRememberMeToken,
  getExpirationDate,
} = require('../utils/Token.util');

async function createAuthToken(data) {
  const token = data.rememberMe
    ? generateRememberMeToken(data.ownerId, data.role)
    : generateToken(data.ownerId, data.role);

  return prisma.authToken.create({
    data: {
      token,
      ownerId: data.ownerId,
      expiresAt: getExpirationDate(data.rememberMe),
      rememberMe: data.rememberMe,
    },
  });
}

async function deleteAuthToken(token) {
  return prisma.authToken.delete({
    where: { token },
  });
}

async function findToken(token) {
  return prisma.authToken.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      ownerId: true,
      rememberMe: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

module.exports = {
  createAuthToken,
  deleteAuthToken,
  findToken,
};
