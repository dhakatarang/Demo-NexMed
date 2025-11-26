// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const { mainDB } = require('../database/dbConnections');
const path = require('path');
const fs = require('fs');

const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    const medicalLicense = req.file;

    console.log('📝 Signup request:', { name, email, userType });

    // Validation
    if (!name || !email || !password || !userType) {
      if (medicalLicense) {
        fs.unlinkSync(medicalLicense.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    mainDB.get(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, existingUser) => {
        if (err) {
          if (medicalLicense) fs.unlinkSync(medicalLicense.path);
          console.error('❌ Database error during signup:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error during registration' 
          });
        }

        if (existingUser) {
          if (medicalLicense) fs.unlinkSync(medicalLicense.path);
          return res.status(400).json({ 
            success: false, 
            message: 'User already exists with this email' 
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Handle medical license file
        let medicalLicensePath = null;
        if (medicalLicense) {
          const uploadsDir = path.join(__dirname, '../uploads/licenses');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const fileExtension = path.extname(medicalLicense.originalname);
          const fileName = `license-${Date.now()}${fileExtension}`;
          const filePath = path.join(uploadsDir, fileName);
          
          fs.renameSync(medicalLicense.path, filePath);
          medicalLicensePath = `licenses/${fileName}`;
        }

        // Insert new user (NO profile photo during signup)
        mainDB.run(
          `INSERT INTO users (name, email, password, user_type, medical_license_path) 
           VALUES (?, ?, ?, ?, ?)`,
          [name, email, hashedPassword, userType, medicalLicensePath],
          function(err) {
            if (err) {
              if (medicalLicensePath) {
                fs.unlinkSync(path.join(__dirname, '../uploads', medicalLicensePath));
              }
              console.error('❌ Error creating user:', err);
              return res.status(500).json({ 
                success: false, 
                message: 'Error creating user account' 
              });
            }

            const userId = this.lastID;
            
            res.status(201).json({
              success: true,
              message: 'User registered successfully',
              user: {
                id: userId,
                name,
                email,
                userType
              }
            });
          }
        );
      }
    );

  } catch (error) {
    console.error('❌ Server error during signup:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    mainDB.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error('❌ Database error during login:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error during login' 
          });
        }

        if (!user) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }

        // Return user data (without password) - FIXED: Include role mapping
        const { password: _, ...userData } = user;
        
        // Map user_type to role for frontend compatibility
        const userWithRole = {
          ...userData,
          role: userData.role || userData.user_type // Use role if exists, fallback to user_type
        };
        
        console.log('👤 User login data:', userWithRole);
        console.log('🔑 User role:', userWithRole.role);
        console.log('👑 Is admin?', userWithRole.role === 'admin');
        
        res.json({
          success: true,
          message: 'Login successful',
          user: userWithRole, // Send the mapped user data
          token: user.id.toString()
        });
      }
    );

  } catch (error) {
    console.error('❌ Server error during login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message 
    });
  }
};
module.exports = { signup, login };