const { prisma } = require('../config/prisma');

async function createPost(data) {
    return await prisma.post.create({
        data: {
            title: data.title,
            description: data.description,
            userId: data.userId,
            status: PostStatus.PUBLISHED,
        }
    });
}

async function updatePost(id, data) {
    return await prisma.post.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            status: data.status,
            updatedAt: new Date(),
        },
    });
}


async function archivePost(id) {
    return await prisma.post.update({
        where: { id },
        data: {
            status: PostStatus.ARCHIVED,
            updatedAt: new Date(),
        },
    });
}


async function deletePost(id) {
    return await prisma.post.update({
        where: { id },
        data: {
            status: PostStatus.DELETED,
            updatedAt: new Date(),
            deletedAt: new Date(),
        },
    });
}

async function getAllActivePosts() {
    return await prisma.post.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
        },
        include: {
            user: true,
        },
    });
}


async function getPostById(id) {
    return await prisma.post.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
        },
        include: {
            user: true
        },
    });
}

module.exports = {
    createPost,
    updatePost,
    archivePost,
    deletePost,
    getAllActivePosts,
    getPostById,
};