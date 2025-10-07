import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Database setup
const dbPath = path.join(__dirname, 'database', 'nexmed.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
        }
    });

    // Create medicines table
    db.run(`
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            expiry_date TEXT,
            batch_number TEXT,
            manufacturer TEXT,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating medicines table:', err);
        } else {
            console.log('Medicines table ready');
        }
    });
}

// Promisify database operations for easier use
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Debug route to check all users (remove in production)
app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await dbAll('SELECT id, email, name, password FROM users');
        res.json({ 
            totalUsers: users.length,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                passwordLength: user.password ? user.password.length : 0,
                passwordPreview: user.password ? user.password.substring(0, 20) + '...' : 'null'
            }))
        });
    } catch (error) {
        console.error('Debug users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// User registration - UPDATED WITH BETTER LOGGING
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        console.log('Registration attempt:', { email, name, passwordLength: password?.length });

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            console.log('Registration failed: User already exists', email);
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Password hashed successfully. Hash:', hashedPassword.substring(0, 20) + '...');

        // Insert user
        const result = await dbRun(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name || '']
        );

        const token = jwt.sign({ userId: result.id, email }, JWT_SECRET);
        
        console.log('Registration successful for:', email, 'User ID:', result.id);
        
        res.json({ 
            success: true,
            token, 
            user: { 
                id: result.id, 
                email, 
                name: name || '' 
            } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// User login - UPDATED WITH DETAILED DEBUGGING
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email, passwordLength: password?.length });

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Trim and lowercase email for consistency
        const cleanEmail = email.trim().toLowerCase();
        
        // Find user
        const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
        
        if (!user) {
            console.log('Login failed: User not found', cleanEmail);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        console.log('User found:', { 
            id: user.id, 
            email: user.email,
            storedPasswordPreview: user.password ? user.password.substring(0, 20) + '...' : 'null',
            storedPasswordLength: user.password ? user.password.length : 0
        });

        // Check password with detailed logging
        console.log('Comparing passwords...');
        console.log('Input password:', password);
        console.log('Stored hash:', user.password);
        
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', validPassword);

        if (!validPassword) {
            console.log('Login failed: Invalid password for user', cleanEmail);
            
            // Additional debug: try to see if it's a whitespace issue
            const trimmedPassword = password.trim();
            const trimmedValid = await bcrypt.compare(trimmedPassword, user.password);
            console.log('Trimmed password comparison:', trimmedValid);
            
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
        
        console.log('Login successful for:', user.email, 'User ID:', user.id);
        
        res.json({ 
            success: true,
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Debug login endpoint to test password issues
app.post('/api/debug-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('=== DEBUG LOGIN ===');
        console.log('Input email:', email);
        console.log('Input password:', `"${password}"`, 'Length:', password?.length);
        
        const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
        
        if (!user) {
            return res.json({ 
                success: false, 
                reason: 'User not found',
                userExists: false 
            });
        }
        
        console.log('User in database:', {
            id: user.id,
            email: user.email,
            passwordHash: user.password,
            passwordLength: user.password.length
        });
        
        const valid = await bcrypt.compare(password, user.password);
        const validTrimmed = await bcrypt.compare(password.trim(), user.password);
        
        return res.json({
            success: valid,
            userExists: true,
            passwordMatch: valid,
            passwordMatchTrimmed: validTrimmed,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
        
    } catch (error) {
        console.error('Debug login error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Upload medicine and extract expiry
app.post('/api/upload-medicine', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        console.log('Processing image:', req.file.filename);

        // OCR processing
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(req.file.path);
        await worker.terminate();

        console.log('Extracted text:', text);

        // Extract details
        const expiryDate = extractExpiryDate(text);
        const medicineName = extractMedicineName(text);
        const batchNumber = extractBatchNumber(text);

        // Save to database
        const result = await dbRun(
            `INSERT INTO medicines (user_id, name, expiry_date, batch_number, manufacturer, image_path) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.userId, medicineName, expiryDate, batchNumber, '', req.file.filename]
        );

        // Check if expiry is within 2 months
        const today = new Date();
        const expiry = new Date(expiryDate);
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

        const isExpiringSoon = expiry <= twoMonthsFromNow;

        res.json({
            id: result.id,
            name: medicineName,
            expiryDate,
            batchNumber,
            imageUrl: `/uploads/${req.file.filename}`,
            isExpiringSoon,
            extractedText: text
        });

    } catch (error) {
        console.error('OCR Error:', error);
        res.status(500).json({ error: 'Failed to process image: ' + error.message });
    }
});

// Get user's medicines
app.get('/api/medicines', authenticateToken, async (req, res) => {
    try {
        const medicines = await dbAll(
            'SELECT * FROM medicines WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );

        // Add expiry status
        const medicinesWithStatus = medicines.map(medicine => {
            const today = new Date();
            const expiry = new Date(medicine.expiry_date);
            const twoMonthsFromNow = new Date();
            twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

            return {
                ...medicine,
                isExpiringSoon: expiry <= twoMonthsFromNow,
                isExpired: expiry < today
            };
        });

        res.json(medicinesWithStatus);
    } catch (error) {
        console.error('Fetch medicines error:', error);
        res.status(500).json({ error: 'Failed to fetch medicines' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Test routes:`);
    console.log(`   http://localhost:${PORT}/api/test`);
    console.log(`   http://localhost:${PORT}/api/debug/users`);
});

// Helper functions for text extraction
function extractExpiryDate(text) {
    // Improved date patterns
    const datePatterns = [
        /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g,
        /\b(EXP:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}))\b/gi,
        /\b(Expiry:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}))\b/gi,
        /\b(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g
    ];

    for (const pattern of datePatterns) {
        const matches = text.match(pattern);
        if (matches && matches[0]) {
            let date = matches[0].replace(/EXP:\s*|Expiry:\s*/gi, '').trim();
            // Basic date format normalization
            if (date.includes('/')) {
                const parts = date.split('/');
                if (parts[2].length === 2) {
                    parts[2] = '20' + parts[2];
                    date = parts.join('/');
                }
            }
            return date;
        }
    }

    // Return a default date 1 year from now if no date found
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    return defaultDate.toISOString().split('T')[0];
}

function extractMedicineName(text) {
    // Extract first meaningful line
    const lines = text.split('\n')
        .filter(line => line.trim().length > 3)
        .filter(line => !line.match(/expiry|exp|batch|lot|manufacturer|mg|ml|tablet|capsule/i));
    
    return lines[0]?.trim() || 'Unknown Medicine';
}

function extractBatchNumber(text) {
    const batchPatterns = [
        /Batch[:]?\s*([A-Z0-9\-]+)/i,
        /Lot[:]?\s*([A-Z0-9\-]+)/i,
        /B\.No[:]?\s*([A-Z0-9\-]+)/i,
        /Batch\s*No[:]?\s*([A-Z0-9\-]+)/i
    ];

    for (const pattern of batchPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return 'N/A';
}