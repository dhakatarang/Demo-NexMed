// backend/database/dbConnections.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const openDB = (dbName) => {
  const file = path.join(__dirname, dbName);
  console.log(`📁 Opening database: ${file}`);
  
  return new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(`❌ Failed to open ${dbName}:`, err.message);
    } else {
      console.log(`✅ Successfully opened ${dbName}`);
    }
  });
};

const authDB = openDB('auth.db');
const medicinesDB = openDB('medicines.db');
const equipmentsDB = openDB('equipments.db');
const donateRentDB = openDB('donaterent.db');
const profileDB = openDB('profile.db');

// Test connection immediately
authDB.get("SELECT 1", (err) => {
  if (err) {
    console.error('❌ Auth DB connection test failed:', err);
  } else {
    console.log('✅ Auth DB connection test passed');
  }
});

module.exports = { authDB, medicinesDB, equipmentsDB, donateRentDB, profileDB };