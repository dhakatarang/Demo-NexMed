// backend/routes/donaterentRoutes.js
const express = require('express');
const router = express.Router();
const { create, list } = require('../controllers/donaterentController');
const { authMiddleware } = require('../utils/authMiddleware');

router.post('/', authMiddleware, create);
router.get('/', authMiddleware, list);

module.exports = router;
