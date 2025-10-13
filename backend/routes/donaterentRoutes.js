const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { donateRentDB, medicinesDB, equipmentsDB } = require("../database/dbConnections");
const { authMiddleware } = require("../utils/authMiddleware");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/items');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// Error handling for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 5MB.' 
      });
    }
  }
  next(error);
};

// Add item to donaterent and respective database (Protected route)
router.post("/add", authMiddleware, upload.single('image'), handleMulterError, (req, res) => {
  try {
    const {
      itemType,
      optionType,
      name,
      description,
      quantity,
      price,
      rentPrice,
      duration,
      termsAccepted
    } = req.body;

    const userId = req.userId;

    console.log('📦 Adding new item:', { itemType, optionType, name, userId });

    // Validation
    if (!termsAccepted || termsAccepted === 'false') {
      return res.status(400).json({ 
        success: false, 
        message: "Please accept terms and conditions" 
      });
    }

    if (!name || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and quantity are required" 
      });
    }

    // Validate option types based on item type
    if (itemType === 'medicine' && !['donate', 'sell'].includes(optionType)) {
      return res.status(400).json({ 
        success: false, 
        message: "For medicines, only 'donate' or 'sell' options are allowed" 
      });
    }

    if (itemType === 'medicalequipment' && !['donate', 'sell', 'rent'].includes(optionType)) {
      return res.status(400).json({ 
        success: false, 
        message: "For medical equipment, only 'donate', 'sell', or 'rent' options are allowed" 
      });
    }

    const image = req.file ? `items/${req.file.filename}` : null;

    // Insert into donaterent table
    const donaterentQuery = `
      INSERT INTO donaterent 
      (itemType, optionType, name, description, quantity, price, rentPrice, duration, image, user_id, termsAccepted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    donateRentDB.run(donaterentQuery, [
      itemType, optionType, name, description, parseInt(quantity), 
      price ? parseFloat(price) : null, 
      rentPrice ? parseFloat(rentPrice) : null, 
      duration || null, 
      image, userId, 1
    ], function(err) {
      if (err) {
        console.error('❌ Error adding to donaterent:', err);
        // Clean up uploaded file if database error
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          success: false, 
          message: "Error adding item to database", 
          error: err.message 
        });
      }

      const itemId = this.lastID;
      console.log(`✅ Item added to donaterent with ID: ${itemId}`);

      // Also add to respective database (medicines or equipments)
      if (itemType === 'medicine') {
        const medicineQuery = `
          INSERT INTO medicines 
          (itemType, optionType, name, description, quantity, price, image, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        medicinesDB.run(medicineQuery, [
          itemType, optionType, name, description, parseInt(quantity), 
          price ? parseFloat(price) : null, image, userId
        ], function(err) {
          if (err) {
            console.error('❌ Error adding to medicines:', err);
          } else {
            console.log(`✅ Medicine added with ID: ${this.lastID}`);
          }
        });

      } else if (itemType === 'medicalequipment') {
        const equipmentQuery = `
          INSERT INTO equipments 
          (itemType, optionType, name, description, quantity, price, rentPrice, duration, image, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        equipmentsDB.run(equipmentQuery, [
          itemType, optionType, name, description, parseInt(quantity), 
          price ? parseFloat(price) : null,
          rentPrice ? parseFloat(rentPrice) : null,
          duration || null, image, userId
        ], function(err) {
          if (err) {
            console.error('❌ Error adding to equipments:', err);
          } else {
            console.log(`✅ Equipment added with ID: ${this.lastID}`);
          }
        });
      }

      res.json({
        success: true,
        message: "Item added successfully!",
        id: itemId,
        itemType: itemType
      });
    });

  } catch (error) {
    console.error('❌ Server error in donaterent/add:', error);
    // Clean up uploaded file on server error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Server error while processing your request",
      error: error.message
    });
  }
});

// Get all donaterent items (Public route)
router.get("/all", (req, res) => {
  donateRentDB.all(
    `SELECT dr.*, u.name as user_name 
     FROM donaterent dr 
     LEFT JOIN users u ON dr.user_id = u.id 
     ORDER BY dr.created_at DESC`, 
    [], 
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching donaterent items:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching items", 
          error: err.message 
        });
      }
      
      // Convert boolean values and format response
      const items = rows.map(item => ({
        ...item,
        termsAccepted: Boolean(item.termsAccepted),
        user: {
          id: item.user_id,
          name: item.user_name
        }
      }));

      res.json({ 
        success: true, 
        items: items,
        count: items.length 
      });
    }
  );
});

// Get user's items (Protected route)
router.get("/my-items", authMiddleware, (req, res) => {
  const userId = req.userId;
  
  donateRentDB.all(
    `SELECT * FROM donaterent WHERE user_id = ? ORDER BY created_at DESC`, 
    [userId], 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching your items", 
          error: err.message 
        });
      }
      
      const items = rows.map(item => ({
        ...item,
        termsAccepted: Boolean(item.termsAccepted)
      }));

      res.json({ 
        success: true, 
        items: items,
        count: items.length 
      });
    }
  );
});

// Get items by type (Public route)
router.get("/type/:itemType", (req, res) => {
  const { itemType } = req.params;
  
  donateRentDB.all(
    `SELECT dr.*, u.name as user_name 
     FROM donaterent dr 
     LEFT JOIN users u ON dr.user_id = u.id 
     WHERE dr.itemType = ? 
     ORDER BY dr.created_at DESC`, 
    [itemType], 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching items", 
          error: err.message 
        });
      }
      
      const items = rows.map(item => ({
        ...item,
        termsAccepted: Boolean(item.termsAccepted),
        user: {
          id: item.user_id,
          name: item.user_name
        }
      }));

      res.json({ 
        success: true, 
        items: items,
        count: items.length 
      });
    }
  );
});

// Get single item by ID (Public route)
router.get("/item/:id", (req, res) => {
  const { id } = req.params;
  
  donateRentDB.get(
    `SELECT dr.*, u.name as user_name, u.email as user_email 
     FROM donaterent dr 
     LEFT JOIN users u ON dr.user_id = u.id 
     WHERE dr.id = ?`, 
    [id], 
    (err, row) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching item", 
          error: err.message 
        });
      }
      if (!row) {
        return res.status(404).json({ 
          success: false, 
          message: "Item not found" 
        });
      }
      
      const item = {
        ...row,
        termsAccepted: Boolean(row.termsAccepted),
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email
        }
      };

      res.json({ 
        success: true, 
        item: item 
      });
    }
  );
});
// Get all donations (for profile page)
router.get("/", authMiddleware, (req, res) => {
  const userId = req.userId;
  
  donateRentDB.all(
    `SELECT dr.*, u.name as user_name 
     FROM donaterent dr 
     LEFT JOIN users u ON dr.user_id = u.id 
     ORDER BY dr.created_at DESC`, 
    [], 
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching donations:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching donations", 
          error: err.message 
        });
      }
      
      // Convert boolean values and format response
      const items = rows.map(item => ({
        ...item,
        termsAccepted: Boolean(item.termsAccepted),
        user: {
          id: item.user_id,
          name: item.user_name
        }
      }));

      res.json({ 
        success: true, 
        items: items
      });
    }
  );
});
// Test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "DonateRent API is working!",
    endpoints: {
      "POST /add": "Add new item (Protected)",
      "GET /all": "Get all items",
      "GET /my-items": "Get user's items (Protected)",
      "GET /type/:itemType": "Get items by type",
      "GET /item/:id": "Get single item"
    }
  });
});

module.exports = router;