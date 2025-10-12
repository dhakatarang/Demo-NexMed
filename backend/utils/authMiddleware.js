// backend/utils/authMiddleware.js
const jwt = require('jsonwebtoken');

// Use environment variable with fallback for development only
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and has correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Check if token exists after removing prefix
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. Invalid token format.',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate token payload structure
    if (!decoded.id || !decoded.iat) {
      return res.status(401).json({ 
        error: 'Invalid token payload',
        code: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    // Add user information to request object
    req.user = {
      id: decoded.id,
      // Add other user fields if they exist in the token
      ...(decoded.email && { email: decoded.email }),
      ...(decoded.role && { role: decoded.role })
    };
    
    // Optional: Add token expiration info
    req.tokenExpiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;
    
    next();
  } catch (err) {
    // Handle different JWT error types specifically
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED',
        expiresAt: err.expiredAt
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    if (err.name === 'NotBeforeError') {
      return res.status(401).json({ 
        error: 'Token not yet active',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    // For any other unexpected errors
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional: Create a middleware for optional authentication
// (Useful for routes that work with or without authentication)
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without user data
  }

  const token = authHeader.substring(7);
  
  if (!token) {
    return next(); // Continue without user data
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.id && decoded.iat) {
      req.user = {
        id: decoded.id,
        ...(decoded.email && { email: decoded.email }),
        ...(decoded.role && { role: decoded.role })
      };
      req.tokenExpiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;
    }
    
    next();
  } catch (err) {
    // For optional auth, we just continue without user data
    next();
  }
};

// Enhanced middleware with role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    // First authenticate the user
    authMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // Check if user has required role
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // If roles is an array, check if user has any of the roles
      // If roles is a string, check if user has that specific role
      const userRole = req.user.role || 'user';
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredRoles,
          current: userRole
        });
      }

      next();
    });
  };
};

// Token refresh validation middleware (if you implement token refresh)
const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ 
      error: 'Refresh token required',
      code: 'REFRESH_TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Refresh tokens should have a specific purpose flag
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

module.exports = { 
  authMiddleware, 
  optionalAuthMiddleware, 
  requireRole, 
  validateRefreshToken 
};
