const bcrypt = require('bcryptjs');
const { authDB } = require('../database/dbConnections');
const path = require('path');
const fs = require('fs');

const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    const medicalLicense = req.file;

    console.log('📝 Signup request:', { name, email, userType });

    // Validation
    if (!name || !email || !password || !userType) {
      // Clean up uploaded file if validation fails
      if (medicalLicense) {
        fs.unlinkSync(medicalLicense.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    authDB.get(
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

        // Insert new user
        authDB.run(
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

    authDB.get(
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

        // Return user data (without password)
        const { password: _, ...userData } = user;
        
        res.json({
          success: true,
          message: 'Login successful',
          user: userData,
          // In a real app, you'd return a JWT token here
          token: user.id.toString() // Using user ID as simple token for demo
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