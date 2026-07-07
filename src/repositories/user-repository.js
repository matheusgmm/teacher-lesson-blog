const { prisma } = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function createUser(data) {
  return await prisma.user.create({
    data: {
        name: data.name,
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        role: 'USER',
    }
  });
}


async function createAdminUser(data) {
    return await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
            role: 'ADMIN',
        }
    })
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
            createdAt: true,
            updatedAt: true,
        },
    });
}


async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
  });
}


async function updateUser(id, data) {
    return await prisma.user.update({
        where: { id },
        data: {
            name: data.name,
            email: data.email,
            password: data.password ? await bcrypt.hash(data.password, 10) : undefined,
            role: data.role,
            updatedAt: new Date(),
        },
    });
}


async function deactivateUser(id) {
    return await prisma.user.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            updatedAt: new Date(),
        },
    });
}


async function getAllActiveUsers() {
    return await prisma.user.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
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
    createAdminUser,
    findByEmail,
    getUserById,
    updateUser,
    deactivateUser,
    getAllActiveUsers,
    getUserAndPosts,
};