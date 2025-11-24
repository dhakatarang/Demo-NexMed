// backend/database/dbConnections.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure databases directory exists
const dbDir = path.join(__dirname, '../databases');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created databases directory');
}

// Ensure uploads directories exist
const uploadsDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/items'),
  path.join(__dirname, '../uploads/profiles')
];

uploadsDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created uploads directory: ${dir}`);
  }
});

// Database file paths - using single database file for better relationships
const dbPaths = {
  main: path.join(dbDir, 'nexmed.db')  // Single database for all tables
};

console.log('📊 Database path:', dbPaths.main);

// Create single database connection with foreign keys enabled
const createDBConnection = (dbPath, dbName) => {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(`❌ Error connecting to ${dbName} database:`, err.message);
    } else {
      console.log(`✅ Connected to ${dbName} database: ${dbPath}`);
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
      db.run('PRAGMA journal_mode = WAL'); // Better performance
    }
  });

  // Add error handler
  db.on('error', (err) => {
    console.error(`💥 Database error (${dbName}):`, err);
  });

  return db;
};

const mainDB = createDBConnection(dbPaths.main, 'main');

// For backward compatibility, export individual DB references
module.exports = {
  // Main database connection
  mainDB,
  
  // Individual DB references (all point to same database)
  authDB: mainDB,
  medicinesDB: mainDB,
  equipmentsDB: mainDB,
  donateRentDB: mainDB,
  profileDB: mainDB,
  
  dbPaths
};