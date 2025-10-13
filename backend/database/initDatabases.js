const { authDB, medicinesDB, equipmentsDB, donateRentDB, profileDB } = require('./dbConnections');

function initAllDatabases() {
  console.log('🔄 Starting database initialization...');

  // Initialize Users/Auth Database
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
    }
  });

  // Initialize Medicines Database
  medicinesDB.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemType TEXT DEFAULT 'medicine',
      optionType TEXT NOT NULL CHECK(optionType IN ('donate', 'sell')),
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2),
      image TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'available'
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating medicines table:', err);
    } else {
      console.log('✅ Medicines table created/verified');
    }
  });

  // Initialize Equipment Database
  equipmentsDB.run(`
    CREATE TABLE IF NOT EXISTS equipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemType TEXT DEFAULT 'medicalequipment',
      optionType TEXT NOT NULL CHECK(optionType IN ('donate', 'sell', 'rent')),
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2),
      rentPrice DECIMAL(10,2),
      duration TEXT,
      image TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'available'
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating equipments table:', err);
    } else {
      console.log('✅ Equipments table created/verified');
    }
  });

  // Initialize DonateRent Database
  donateRentDB.run(`
    CREATE TABLE IF NOT EXISTS donaterent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemType TEXT NOT NULL CHECK(itemType IN ('medicine', 'medicalequipment')),
      optionType TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2),
      rentPrice DECIMAL(10,2),
      duration TEXT,
      image TEXT,
      user_id INTEGER,
      termsAccepted BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'available'
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating donaterent table:', err);
    } else {
      console.log('✅ DonateRent table created/verified');
    }
  });

  // Initialize Profile Database
  profileDB.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      full_name TEXT,
      phone TEXT,
      address TEXT,
      date_of_birth TEXT,
      emergency_contact TEXT,
      medical_history TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating profiles table:', err);
    } else {
      console.log('✅ Profiles table created/verified');
    }
  });

  console.log('📊 All database tables initialized successfully');

  // Add sample data after a short delay
  setTimeout(addSampleData, 1000);
};

// Add sample data for testing
const addSampleData = () => {
  console.log('📝 Checking for sample data...');

  // Check and add sample medicines
  medicinesDB.get("SELECT COUNT(*) as count FROM medicines", (err, row) => {
    if (!err && row.count === 0) {
      console.log('📝 Adding sample medicines data...');
      
      const sampleMedicines = [
        ['medicine', 'donate', 'Paracetamol 500mg', 'Pain and fever relief tablets', 50, null, 'medicine1.jpg', 1],
        ['medicine', 'sell', 'Vitamin C 1000mg', 'Immune system booster capsules', 30, 5.99, 'medicine2.jpg', 1],
        ['medicine', 'donate', 'Aspirin 75mg', 'Blood thinner and pain reliever', 25, null, 'medicine3.jpg', 1],
        ['medicine', 'sell', 'Ibuprofen 400mg', 'Anti-inflammatory pain reliever', 40, 8.50, 'medicine4.jpg', 1]
      ];

      sampleMedicines.forEach((medicine, index) => {
        medicinesDB.run(
          `INSERT INTO medicines (itemType, optionType, name, description, quantity, price, image, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          medicine,
          function(err) {
            if (err) {
              console.error('Error adding sample medicine:', err);
            } else if (index === sampleMedicines.length - 1) {
              console.log('✅ Sample medicines added successfully');
            }
          }
        );
      });
    }
  });

  // Check and add sample equipment
  equipmentsDB.get("SELECT COUNT(*) as count FROM equipments", (err, row) => {
    if (!err && row.count === 0) {
      console.log('📝 Adding sample equipment data...');
      
      const sampleEquipments = [
        ['medicalequipment', 'rent', 'Oxygen Concentrator', 'Portable oxygen machine for respiratory support', 5, null, 25.00, '30', 'equipment1.jpg', 1],
        ['medicalequipment', 'sell', 'Blood Pressure Monitor', 'Digital automatic BP monitor with cuff', 15, 49.99, null, null, 'equipment2.jpg', 1],
        ['medicalequipment', 'donate', 'Wheelchair', 'Standard transport wheelchair with brakes', 3, null, null, null, 'equipment3.jpg', 1],
        ['medicalequipment', 'rent', 'Nebulizer Machine', 'Electric nebulizer for asthma treatment', 8, null, 15.00, '14', 'equipment4.jpg', 1]
      ];

      sampleEquipments.forEach((equipment, index) => {
        equipmentsDB.run(
          `INSERT INTO equipments (itemType, optionType, name, description, quantity, price, rentPrice, duration, image, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          equipment,
          function(err) {
            if (err) {
              console.error('Error adding sample equipment:', err);
            } else if (index === sampleEquipments.length - 1) {
              console.log('✅ Sample equipment added successfully');
            }
          }
        );
      });
    }
  });

  // Check and add sample user
  authDB.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (!err && row.count === 0) {
      console.log('📝 Adding sample user data...');
      
      // Note: In production, password should be hashed
      authDB.run(
        `INSERT INTO users (name, email, password, user_type) 
         VALUES (?, ?, ?, ?)`,
        ['Demo User', 'demo@nexmed.com', 'password123', 'donor'],
        function(err) {
          if (err) {
            console.error('Error adding sample user:', err);
          } else {
            console.log('✅ Sample user added successfully');
          }
        }
      );
    }
  });
};

module.exports = { initAllDatabases };