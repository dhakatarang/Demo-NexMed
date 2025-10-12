// backend/database/initDatabases.js
const { authDB, medicinesDB, equipmentsDB, donateRentDB, profileDB } = require('./dbConnections');

function initAllDatabases() {
  // Updated users table with new columns
  authDB.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT,
    medical_license_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err);
    } else {
      console.log('✅ Users table created/verified');
      // Add missing columns if table already existed
      addMissingColumns();
    }
  });

  // medicines
  medicinesDB.run(`CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    quantity INTEGER,
    expiryDate TEXT
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating medicines table:', err);
    } else {
      console.log('✅ Medicines table created/verified');
    }
  });

  // equipments
  equipmentsDB.run(`CREATE TABLE IF NOT EXISTS equipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    quantity INTEGER,
    condition TEXT
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating equipments table:', err);
    } else {
      console.log('✅ Equipments table created/verified');
    }
  });

  // donaterent
  donateRentDB.run(`CREATE TABLE IF NOT EXISTS donaterent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    itemType TEXT,
    itemId INTEGER,
    createdAt TEXT
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating donaterent table:', err);
    } else {
      console.log('✅ Donaterent table created/verified');
    }
  });

  // profile
  profileDB.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER UNIQUE,
    phone TEXT,
    address TEXT,
    avatarUrl TEXT
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating profiles table:', err);
    } else {
      console.log('✅ Profiles table created/verified');
    }
  });
}

// Function to add missing columns to existing tables
function addMissingColumns() {
  const alterQueries = [
    `ALTER TABLE users ADD COLUMN user_type TEXT`,
    `ALTER TABLE users ADD COLUMN medical_license_path TEXT`,
    `ALTER TABLE users ADD COLUMN created_at DATETIME`
  ];

  alterQueries.forEach((query, index) => {
    authDB.run(query, (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`ℹ️ Column already exists in users table`);
        } else {
          console.error(`❌ Error adding column to users table:`, err.message);
        }
      } else {
        console.log(`✅ Added new column to users table: ${query}`);
      }
    });
  });
}

module.exports = { initAllDatabases };