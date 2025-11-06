const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/authMiddleware');
const { mainDB } = require('../database/dbConnections');

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Fetching profile for user ID:', req.user.id);
    console.log('👤 req.user object:', req.user);
    
    // Since authMiddleware already fetches the user, we can use req.user directly
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Found user:', req.user);

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      user: req.user // This will be the actual logged-in user
    });

  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test route (keep this for testing)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Profile route is working!'
  });
});

// Debug route to check what's in req.user
router.get('/debug', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Debug info',
    userFromToken: req.user,
    userId: req.userId,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;