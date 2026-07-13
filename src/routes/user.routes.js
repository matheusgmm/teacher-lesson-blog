const express = require('express');
const { updateUser, deleteUser } = require('../controllers/user-controller');
const { authenticateToken } = require('../middlewares/auth-middleware');
const { isAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

router.patch('/', authenticateToken, updateUser);
router.patch('/:id', authenticateToken, isAdmin, updateUser);

router.delete('/:id', authenticateToken, isAdmin, deleteUser);
router.delete('/', authenticateToken, isAdmin, deleteUser);

module.exports = router;
