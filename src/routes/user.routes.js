const express = require('express');
const { updateUser, deleteUser } = require('../controllers/user-controller');

const router = express.Router();

router.patch('/update/:id', updateUser);
router.patch('/update', updateUser);

router.delete('/delete/:id', deleteUser);
router.delete('/delete', deleteUser);

module.exports = router;
