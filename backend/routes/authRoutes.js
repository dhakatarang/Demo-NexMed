// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { authMiddleware } = require('../utils/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads (medical license only during signup)
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX are allowed.'));
    }
  }
});

// Error handling for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 5MB.' 
      });
    }
  }
  next(error);
};

// Get current user details
router.get('/me', authMiddleware, (req, res) => {
  const userId = req.userId;

  mainDB.get(
    `SELECT id, name, email, user_type, medical_license_path, profile_photo, 
            phone, address, date_of_birth, emergency_contact, medical_history,
            created_at, updated_at
     FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        console.error('❌ Error fetching user:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching user data" 
        });
      }

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      const userData = {
        ...user,
        profile_photo: user.profile_photo ? `/uploads/profiles/${user.profile_photo}` : null
      };

      res.json({
        success: true,
        user: userData
      });
    }
  );
});

router.post('/signup', upload.single('medicalLicense'), handleMulterError, signup);
router.post('/login', login);

module.exports = router;