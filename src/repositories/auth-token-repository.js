const { prisma } = require('../config/prisma');
const {
  generateToken,
  generateRememberMeToken,
  getExpirationDate,
} = require('../utils/Token.util');

async function createAuthToken(data) {
  const token = data.rememberMe
    ? generateRememberMeToken(data.owner_id, data.role)
    : generateToken(data.owner_id, data.role);

  return prisma.authToken.create({
    data: {
      token,
      owner_id: data.owner_id,
      expires_at: getExpirationDate(data.rememberMe),
      remember_me: data.rememberMe,
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
      owner_id: true,
      remember_me: true,
      expires_at: true,
      created_at: true,
      updated_at: true,
    },
  });
}

module.exports = {
  createAuthToken,
  deleteAuthToken,
  findToken,
};
