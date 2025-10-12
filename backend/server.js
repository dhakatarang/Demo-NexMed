// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const donaterentRoutes = require("./routes/donaterentRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Import database initialization
const { initAllDatabases } = require("./database/initDatabases");

const app = express();

// Initialize databases when server starts
console.log("🔄 Initializing databases...");
initAllDatabases();
console.log("✅ Databases initialized successfully");

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/", (req, res) => {
  res.send("NexMed Backend is Running ✅");
});

// Debug route to check database state
app.get("/api/debug-db", (req, res) => {
  const { authDB } = require('./database/dbConnections');
  
  console.log("🔍 Checking database state...");
  
  // Check if users table exists
  authDB.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, tableRow) => {
    if (err) {
      console.error('❌ Table check error:', err);
      return res.status(500).json({ error: 'Table check failed: ' + err.message });
    }
    
    if (!tableRow) {
      console.log('❌ Users table does not exist');
      return res.status(500).json({ error: 'Users table not found' });
    }
    
    console.log('✅ Users table exists');
    
    // Check table schema
    authDB.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('❌ Schema check error:', err);
        return res.status(500).json({ error: 'Schema check failed: ' + err.message });
      }
      
      console.log('📋 Users table schema:', columns.map(col => col.name));
      
      // Check current users
      authDB.all("SELECT id, name, email, user_type, medical_license_path, created_at FROM users", (err, users) => {
        if (err) {
          console.error('❌ Users query error:', err);
          return res.status(500).json({ error: 'Users query failed: ' + err.message });
        }
        
        console.log(`📊 Current users in database: ${users.length}`);
        res.json({ 
          message: 'Database is working', 
          tableExists: true,
          userCount: users.length,
          schema: columns.map(col => ({ name: col.name, type: col.type })),
          users: users
        });
      });
    });
  });
});

// Debug route to check specific user registration
app.get("/api/debug-user/:email", (req, res) => {
  const { authDB } = require('./database/dbConnections');
  const { email } = req.params;
  
  console.log(`🔍 Checking user: ${email}`);
  
  authDB.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error('❌ User query error:', err);
      return res.status(500).json({ error: 'User query failed: ' + err.message });
    }
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User found:', user);
    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        medical_license_path: user.medical_license_path,
        created_at: user.created_at
      }
    });
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/donaterent", donaterentRoutes);
app.use("/api/profile", profileRoutes);

// 404 fallback
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
  console.log(`🔍 Database debug: http://localhost:${PORT}/api/debug-db`);
  console.log(`📁 Uploads served from: ${path.join(__dirname, 'uploads')}`);
});