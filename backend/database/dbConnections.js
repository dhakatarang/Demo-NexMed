const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure databases directory exists
const dbDir = path.join(__dirname, '../databases');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created databases directory');
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Database file paths
const dbPaths = {
  auth: path.join(dbDir, 'auth.db'),
  medicines: path.join(dbDir, 'medicines.db'),
  equipments: path.join(dbDir, 'equipments.db'),
  donaterent: path.join(dbDir, 'donaterent.db'),
  profile: path.join(dbDir, 'profile.db')
};

console.log('📊 Database paths:', dbPaths);

// Create database connections with error handling
const createDBConnection = (dbPath, dbName) => {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(`❌ Error connecting to ${dbName} database:`, err.message);
    } else {
      console.log(`✅ Connected to ${dbName} database: ${dbPath}`);
    }
  });
};

const authDB = createDBConnection(dbPaths.auth, 'auth');
const medicinesDB = createDBConnection(dbPaths.medicines, 'medicines');
const equipmentsDB = createDBConnection(dbPaths.equipments, 'equipments');
const donateRentDB = createDBConnection(dbPaths.donaterent, 'donaterent');
const profileDB = createDBConnection(dbPaths.profile, 'profile');

module.exports = {
  authDB,
  medicinesDB,
  equipmentsDB,
  donateRentDB,
  profileDB,
  dbPaths
};