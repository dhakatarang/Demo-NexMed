const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const donaterentRoutes = require("./routes/donaterentRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Import database initialization
const { initAllDatabases } = require("./database/initDatabases");

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Initialize databases when server starts
console.log("🔄 Initializing databases...");
initAllDatabases();
console.log("✅ Databases initialized successfully");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Public routes (no auth required)
app.get("/", (req, res) => {
  res.json({ 
    message: "NexMed Backend is Running ✅",
    version: "2.0",
    features: ["Enhanced Donate/Rent System", "Image Upload", "SQLite3 Database", "User Authentication"],
    timestamp: new Date().toISOString()
  });
});

// Public debug routes
app.get("/api/debug-db", (req, res) => {
  const { authDB, medicinesDB, equipmentsDB, donateRentDB, profileDB } = require('./database/dbConnections');
  
  console.log("🔍 Checking database state...");
  
  const dbChecks = [
    { name: 'users', db: authDB, query: 'SELECT COUNT(*) as count FROM users' },
    { name: 'medicines', db: medicinesDB, query: 'SELECT COUNT(*) as count FROM medicines' },
    { name: 'equipments', db: equipmentsDB, query: 'SELECT COUNT(*) as count FROM equipments' },
    { name: 'donaterent', db: donateRentDB, query: 'SELECT COUNT(*) as count FROM donaterent' },
    { name: 'profiles', db: profileDB, query: 'SELECT COUNT(*) as count FROM profiles' }
  ];

  let results = {};
  let completed = 0;

  dbChecks.forEach(({ name, db, query }) => {
    db.get(query, [], (err, row) => {
      if (err) {
        results[name] = { error: err.message, status: 'error' };
      } else {
        results[name] = { count: row.count, status: 'ok' };
      }
      
      completed++;
      if (completed === dbChecks.length) {
        res.json({ 
          message: 'Database status check completed',
          databases: results,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
});

// Public test routes
app.get("/api/test-donaterent", (req, res) => {
  const { donateRentDB } = require('./database/dbConnections');
  
  donateRentDB.all("SELECT * FROM donaterent ORDER BY id DESC LIMIT 5", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: 'DonateRent test successful',
      items: rows,
      count: rows.length
    });
  });
});

// Protected API routes
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
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
  console.log(`🔍 Database debug: http://localhost:${PORT}/api/debug-db`);
  console.log(`📁 Uploads served from: ${uploadsDir}`);
  console.log(`💊 Medicines API: http://localhost:${PORT}/api/medicines`);
  console.log(`🏥 Equipment API: http://localhost:${PORT}/api/equipments`);
  console.log(`🤝 Donate/Rent API: http://localhost:${PORT}/api/donaterent`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Profile API: http://localhost:${PORT}/api/profile`);
});