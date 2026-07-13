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

async function getAllActiveUsers({ search, page = 1, limit = 10 } = {}) {
  const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * take;

  const where = {
    deleted_at: null,
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where, 
      orderBy: { created_at: 'desc' },
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.user.count({
      where,
    }),
  ])

  return {
    data,
    meta: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    }
  };
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
