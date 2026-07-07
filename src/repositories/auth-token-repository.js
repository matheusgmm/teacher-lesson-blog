const { prisma } = require('../config/prisma');
const { generateToken } = require('../utils/Token.util');

async function createAuthToken(ownerId, role) {
  const token = generateToken(ownerId, role);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return await prisma.authToken.create({
    data: {
      token,
      ownerId,
      expiresAt,
      role,
    },
  });
}

async function deleteAuthToken(token) {
    return await prisma.authToken.delete({
        where: {
            token: token,
        },
    });
}

module.exports = {
  createAuthToken,
  deleteAuthToken,
};
