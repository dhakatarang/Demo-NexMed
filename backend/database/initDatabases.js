// backend/database/initDatabases.js
const { mainDB } = require('./dbConnections');

function initAllDatabases() {
  console.log('🔄 Starting database initialization...');

  // Initialize Users/Auth Database with profile photo support
  mainDB.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT DEFAULT 'Individual Donor / Receiver',
    medical_license_path TEXT,
    profile_photo TEXT,
    phone TEXT,
    address TEXT,
    date_of_birth TEXT,
    emergency_contact TEXT,
    medical_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err);
    } else {
      console.log('✅ Users table created/verified');
    }
  });

  // Medicines table
  mainDB.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT DEFAULT 'medicine',
      option_type TEXT NOT NULL CHECK(option_type IN ('donate', 'sell')),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price DECIMAL(10,2) DEFAULT 0,
      is_donated BOOLEAN DEFAULT 0,
      image_path TEXT,
      added_by INTEGER NOT NULL,
      expiry_date DATE,
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'sold', 'donated', 'expired')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating medicines table:', err);
    } else {
      console.log('✅ Medicines table created/verified');
    }
  });

  // Equipments table
  mainDB.run(`
    CREATE TABLE IF NOT EXISTS equipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT DEFAULT 'medicalequipment',
      option_type TEXT NOT NULL CHECK(option_type IN ('donate', 'sell', 'rent')),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price DECIMAL(10,2) DEFAULT 0,
      rent_price DECIMAL(10,2) DEFAULT 0,
      min_rental_days INTEGER DEFAULT 0,
      is_for_rent BOOLEAN DEFAULT 0,
      is_donated BOOLEAN DEFAULT 0,
      image_path TEXT,
      added_by INTEGER NOT NULL,
      condition TEXT DEFAULT 'good' CHECK(condition IN ('excellent', 'good', 'fair', 'poor')),
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'sold', 'rented', 'donated')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating equipments table:', err);
    } else {
      console.log('✅ Equipments table created/verified');
    }
  });

  // Cart table - NEW
  mainDB.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('medicine', 'medicalequipment')),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price DECIMAL(10,2) DEFAULT 0,
      rent_price DECIMAL(10,2) DEFAULT 0,
      option_type TEXT NOT NULL CHECK(option_type IN ('donate', 'sell', 'rent')),
      image TEXT,
      rental_days INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, item_id, item_type)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating cart table:', err);
    } else {
      console.log('✅ Cart table created/verified');
    }
  });

  // DonateRent table
  mainDB.run(`
    CREATE TABLE IF NOT EXISTS donaterent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('medicine', 'medicalequipment')),
      item_id INTEGER NOT NULL,
      option_type TEXT NOT NULL CHECK(option_type IN ('donate', 'sell', 'rent')),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2),
      rent_price DECIMAL(10,2),
      duration INTEGER,
      image_path TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating donaterent table:', err);
    } else {
      console.log('✅ DonateRent table created/verified');
    }
  });

  // Orders table
  mainDB.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      option_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_amount DECIMAL(10,2),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      shipping_address TEXT,
      contact_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating orders table:', err);
    } else {
      console.log('✅ Orders table created/verified');
    }
  });

  console.log('📊 All database tables initialized successfully');
  createIndexes();
  setTimeout(addSampleData, 1500);
};

function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_medicines_added_by ON medicines(added_by)',
    'CREATE INDEX IF NOT EXISTS idx_medicines_status ON medicines(status)',
    'CREATE INDEX IF NOT EXISTS idx_equipments_added_by ON equipments(added_by)',
    'CREATE INDEX IF NOT EXISTS idx_equipments_status ON equipments(status)',
    'CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_cart_item_type ON cart(item_type)',
    'CREATE INDEX IF NOT EXISTS idx_donaterent_user_id ON donaterent(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_donaterent_item_type ON donaterent(item_type)',
    'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
  ];

  indexes.forEach((sql, index) => {
    mainDB.run(sql, (err) => {
      if (err) {
        console.error('❌ Error creating index:', err);
      } else if (index === indexes.length - 1) {
        console.log('✅ All indexes created/verified');
      }
    });
  });
}

const addSampleData = () => {
  console.log('📝 Checking for sample data...');

  mainDB.get("SELECT COUNT(*) as count FROM users WHERE email = 'demo@nexmed.com'", (err, row) => {
    if (err) {
      console.error('❌ Error checking for demo user:', err);
      return;
    }

    if (row.count === 0) {
      console.log('📝 Adding sample user data...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('password123', 10);
      
      mainDB.run(
        `INSERT INTO users (name, email, password, user_type, phone, address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Demo User', 'demo@nexmed.com', hashedPassword, 'Individual Donor / Receiver', '+1234567890', '123 Main St, City, State'],
        function(err) {
          if (err) {
            console.error('❌ Error adding sample user:', err);
          } else {
            const userId = this.lastID;
            console.log('✅ Sample user added successfully with ID:', userId);
            addSampleMedicines(userId);
            addSampleEquipments(userId);
          }
        }
      );
    } else {
      console.log('📊 Demo user already exists, fetching user ID...');
      mainDB.get("SELECT id FROM users WHERE email = 'demo@nexmed.com'", (err, user) => {
        if (err) {
          console.error('❌ Error fetching demo user:', err);
        } else if (user) {
          console.log('✅ Using existing demo user with ID:', user.id);
          addSampleMedicines(user.id);
          addSampleEquipments(user.id);
        } else {
          console.log('❌ Demo user not found');
        }
      });
    }
  });
};

const addSampleMedicines = (userId) => {
  mainDB.get("SELECT COUNT(*) as count FROM medicines", (err, row) => {
    if (err) {
      console.error('❌ Error checking medicines table:', err);
      return;
    }

    if (row.count === 0) {
      console.log('📝 Adding sample medicines data...');
      
      const sampleMedicines = [
        {
          item_type: 'medicine',
          option_type: 'donate', 
          name: 'Paracetamol 500mg',
          description: 'Pain and fever relief tablets. Effective for headaches, muscle aches, and reducing fever.',
          quantity: 50,
          price: 0,
          is_donated: 1,
          image_path: null,
          added_by: userId,
          expiry_date: '2025-12-31'
        },
        {
          item_type: 'medicine',
          option_type: 'sell',
          name: 'Vitamin C 1000mg', 
          description: 'Immune system booster capsules with extended release formula.',
          quantity: 30,
          price: 5.99,
          is_donated: 0,
          image_path: null,
          added_by: userId,
          expiry_date: '2025-10-15'
        },
        {
          item_type: 'medicine',
          option_type: 'donate',
          name: 'Aspirin 75mg',
          description: 'Low-dose aspirin for heart health and blood thinning. Also effective for pain relief.',
          quantity: 25,
          price: 0,
          is_donated: 1,
          image_path: null,
          added_by: userId,
          expiry_date: '2025-08-20'
        },
        {
          item_type: 'medicine',
          option_type: 'sell',
          name: 'Ibuprofen 400mg',
          description: 'Anti-inflammatory pain reliever for arthritis, back pain, and inflammation.',
          quantity: 40,
          price: 8.50,
          is_donated: 0,
          image_path: null,
          added_by: userId,
          expiry_date: '2025-11-30'
        }
      ];

      let completed = 0;
      sampleMedicines.forEach((medicine, index) => {
        mainDB.run(
          `INSERT INTO medicines (item_type, option_type, name, description, quantity, price, is_donated, image_path, added_by, expiry_date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            medicine.item_type,
            medicine.option_type,
            medicine.name,
            medicine.description,
            medicine.quantity,
            medicine.price,
            medicine.is_donated,
            medicine.image_path,
            medicine.added_by,
            medicine.expiry_date
          ],
          function(err) {
            if (err) {
              console.error('❌ Error adding sample medicine:', err);
            } else {
              const medicineId = this.lastID;
              console.log(`✅ Medicine added: ${medicine.name} with ID: ${medicineId}`);
              
              // Also add to donaterent table
              mainDB.run(
                `INSERT INTO donaterent (user_id, item_type, item_id, option_type, name, description, quantity, price, image_path) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  userId, 
                  'medicine', 
                  medicineId, 
                  medicine.option_type, 
                  medicine.name, 
                  medicine.description, 
                  medicine.quantity, 
                  medicine.price, 
                  `medicine${index + 1}.jpg`
                ],
                (err) => {
                  if (err) {
                    console.error('⚠️ Error adding to donaterent:', err);
                  }
                }
              );
            }
            
            completed++;
            if (completed === sampleMedicines.length) {
              console.log('✅ All sample medicines added successfully');
            }
          }
        );
      });
    } else {
      console.log('📊 Medicines table already has data, skipping sample data');
    }
  });
};

const addSampleEquipments = (userId) => {
  mainDB.get("SELECT COUNT(*) as count FROM equipments", (err, row) => {
    if (err) {
      console.error('❌ Error checking equipments table:', err);
      return;
    }

    if (row.count === 0) {
      console.log('📝 Adding sample equipment data...');
      
      const sampleEquipments = [
        {
          item_type: 'medicalequipment',
          option_type: 'rent',
          name: 'Oxygen Concentrator',
          description: 'Portable oxygen machine for respiratory support with adjustable flow rates.',
          quantity: 5,
          price: 0,
          rent_price: 25.00,
          min_rental_days: 7,
          is_donated: 0,
          is_for_rent: 1,
          image_path: null,
          added_by: userId,
          condition: 'excellent'
        },
        {
          item_type: 'medicalequipment', 
          option_type: 'sell',
          name: 'Blood Pressure Monitor',
          description: 'Digital automatic BP monitor with large display and memory function.',
          quantity: 15,
          price: 49.99,
          rent_price: 0,
          min_rental_days: 0,
          is_donated: 0,
          is_for_rent: 0,
          image_path: null,
          added_by: userId,
          condition: 'good'
        },
        {
          item_type: 'medicalequipment',
          option_type: 'donate', 
          name: 'Wheelchair',
          description: 'Standard transport wheelchair with push-handle brakes and foldable design.',
          quantity: 3,
          price: 0,
          rent_price: 0,
          min_rental_days: 0,
          is_donated: 1,
          is_for_rent: 0,
          image_path: null,
          added_by: userId,
          condition: 'fair'
        },
        {
          item_type: 'medicalequipment',
          option_type: 'rent',
          name: 'Nebulizer Machine', 
          description: 'Electric nebulizer for asthma treatment with mask and mouthpiece.',
          quantity: 8,
          price: 0,
          rent_price: 15.00,
          min_rental_days: 14,
          is_donated: 0,
          is_for_rent: 1,
          image_path: null,
          added_by: userId,
          condition: 'good'
        }
      ];

      let completed = 0;
      sampleEquipments.forEach((equipment, index) => {
        mainDB.run(
          `INSERT INTO equipments (item_type, option_type, name, description, quantity, price, rent_price, min_rental_days, is_donated, is_for_rent, image_path, added_by, condition) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            equipment.item_type,
            equipment.option_type,
            equipment.name,
            equipment.description,
            equipment.quantity,
            equipment.price,
            equipment.rent_price,
            equipment.min_rental_days,
            equipment.is_donated,
            equipment.is_for_rent,
            equipment.image_path,
            equipment.added_by,
            equipment.condition
          ],
          function(err) {
            if (err) {
              console.error('❌ Error adding sample equipment:', err);
            } else {
              const equipmentId = this.lastID;
              console.log(`✅ Equipment added: ${equipment.name} with ID: ${equipmentId}`);
              
              // Also add to donaterent table
              mainDB.run(
                `INSERT INTO donaterent (user_id, item_type, item_id, option_type, name, description, quantity, price, rent_price, duration, image_path) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  userId,
                  'medicalequipment', 
                  equipmentId,
                  equipment.option_type,
                  equipment.name,
                  equipment.description, 
                  equipment.quantity,
                  equipment.price,
                  equipment.rent_price,
                  equipment.min_rental_days,
                  `equipment${index + 1}.jpg`
                ],
                (err) => {
                  if (err) {
                    console.error('⚠️ Error adding to donaterent:', err);
                  }
                }
              );
            }
            
            completed++;
            if (completed === sampleEquipments.length) {
              console.log('✅ All sample equipment added successfully');
              console.log('🎉 Database initialization completed!');
            }
          }
        );
      });
    } else {
      console.log('📊 Equipments table already has data, skipping sample data');
    }
  });
};

module.exports = { initAllDatabases };