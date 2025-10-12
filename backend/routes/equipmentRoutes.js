// backend/routes/equipmentRoutes.js
const express = require('express');
const router = express.Router();
const { getAll, create, remove } = require('../controllers/equipmentController');
const { authMiddleware } = require('../utils/authMiddleware');

router.get('/', getAll);
router.post('/', authMiddleware, create);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
