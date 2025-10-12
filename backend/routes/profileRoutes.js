// backend/routes/profileRoutes.js
const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { authMiddleware } = require('../utils/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getProfile);
router.put('/update', authMiddleware, updateProfile);

module.exports = router;


