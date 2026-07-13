const { prisma } = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function createUser(data) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      role: data.role || 'USER',
    },
  });
}

async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    },
  });
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

async function updateUser(id, data) {
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

async function deactivateUser(id) {
  return await prisma.user.update({
    where: { id },
    data: {
      deleted_at: new Date(),
      updated_at: new Date(),
    },
  });
}

async function getAllActiveUsers() {
  return await prisma.user.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      created_at: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });
}

async function getUserAndPosts(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      posts: true,
    },
  });
}

module.exports = {
  createUser,
  findByEmail,
  getUserById,
  updateUser,
  deactivateUser,
  getAllActiveUsers,
  getUserAndPosts,
};
