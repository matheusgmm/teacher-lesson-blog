const express = require('express');
const { createPost, updatePost, deletePost, getAllActivePosts, getActivePostById } = require('../controllers/post-controller');
const { authenticateToken } = require('../middlewares/auth-middleware');
const { isAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/', authenticateToken, isAdmin, createPost);

router.get('/:id', authenticateToken, getActivePostById);
router.get('/', authenticateToken, getAllActivePosts);

router.patch('/:id', authenticateToken, isAdmin, updatePost);
router.patch('/', authenticateToken, isAdmin, updatePost);

router.delete('/:id', authenticateToken, isAdmin, deletePost);
router.delete('/', authenticateToken, isAdmin, deletePost);

module.exports = router;
