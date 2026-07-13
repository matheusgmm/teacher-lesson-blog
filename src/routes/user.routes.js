const express = require('express');
const { update } = require('../controllers/user-controller');

const router = express.Router();

router.patch('/update/:id', update);
router.patch('/update', update);

module.exports = router;