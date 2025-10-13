const { authDB } = require('../database/dbConnections');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided, authorization denied' 
    });
  }

  try {
    // For now, we'll use a simple user ID from token
    // In a real app, you'd verify JWT token here
    const userId = parseInt(token);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    // Verify user exists in database
    authDB.get(
      "SELECT id, name, email, user_type FROM users WHERE id = ?",
      [userId],
      (err, user) => {
        if (err) {
          console.error('Database error in auth middleware:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error during authentication' 
          });
        }
        
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        req.userId = user.id;
        req.user = user;
        next();
      }
    );
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

module.exports = { authMiddleware };