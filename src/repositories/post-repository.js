const { prisma } = require('../config/prisma');

async function createPost(data) {
  return await prisma.post.create({
    data: {
      title: data.title,
      description: data.description,
      user_id: data.user_id,
      status: 'PUBLISHED',
    },
  });
}

async function updatePost(id, data) {
  return await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      updated_at: new Date(),
    },
  });
}

async function archivePost(id) {
  return await prisma.post.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
      updated_at: new Date(),
    },
  });
}

async function deletePost(id) {
  return await prisma.post.update({
    where: { id },
    data: {
      status: 'DELETED',
      updated_at: new Date(),
      deleted_at: new Date(),
    },
  });
}

async function getAllActivePosts() {
  return await prisma.post.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      created_at: 'desc',
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      created_at: true,
      updated_at: true,
      user_id: true,
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
      created_at: true,
      updated_at: true,
      user_id: true,
      user: true,
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
