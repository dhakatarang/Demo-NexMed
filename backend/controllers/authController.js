// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const signup = async (req, res) => {
    const { name, email, password, userType } = req.body;
    const medicalLicense = req.file;
    
    console.log('🔐 Signup attempt:', { 
        name, 
        email, 
        userType,
        password: password ? '***' : 'missing',
        hasLicenseFile: !!medicalLicense 
    });
    
    if (!name || !email || !password || !userType) {
        console.log('❌ Missing fields');
        return res.status(400).json({ error: 'Name, email, password and user type are required' });
    }

    try {
        console.log('📧 Checking if email exists:', email);
        
        const existingUser = await User.findByEmail(email);
        console.log('📊 Existing user check result:', existingUser);
        
        if (existingUser) {
            console.log('❌ Email already exists');
            return res.status(400).json({ error: 'Email already in use' });
        }

        console.log('🔐 Hashing password...');
        const hashed = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed');
        
        // Handle file upload
        let licensePath = null;
        if (medicalLicense) {
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, '../uploads/licenses');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // Generate unique filename
            const fileExtension = path.extname(medicalLicense.originalname);
            const fileName = `license_${Date.now()}${fileExtension}`;
            licensePath = path.join('licenses', fileName);
            
            // Move file to uploads directory
            const targetPath = path.join(uploadsDir, fileName);
            fs.renameSync(medicalLicense.path, targetPath);
            
            console.log('📄 License file saved:', licensePath);
        }

        console.log('👤 Creating user in database...');
        const userId = await User.create(name, email, hashed, userType, licensePath);
        console.log('✅ User created with ID:', userId);
        
        console.log('🎫 Generating token...');
        const token = jwt.sign({ id: userId, email, userType }, JWT_SECRET, { expiresIn: '7d' });
        
        console.log('🎉 Signup successful for user ID:', userId);
        res.status(201).json({ 
            message: 'User created successfully', 
            token, 
            userId,
            user: { 
                id: userId, 
                name, 
                email, 
                userType 
            }
        });

    } catch (err) {
        console.error('💥 Signup error details:', err);
        console.error('💥 Error stack:', err.stack);
        res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const user = await User.findByEmail(email);
        console.log('📊 User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('🔐 Comparing passwords...');
        const match = await bcrypt.compare(password, user.password);
        console.log('🔐 Password match:', match);
        
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ 
            id: user.id, 
            email: user.email, 
            userType: user.user_type 
        }, JWT_SECRET, { expiresIn: '7d' });
        
        console.log('✅ Login successful for user ID:', user.id);
        res.json({ 
            message: 'Login successful', 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                userType: user.user_type
            } 
        });

    } catch (err) {
        console.error('💥 Login error:', err);
        res.status(500).json({ error: 'Login failed: ' + err.message });
    }
};

module.exports = { signup, login };