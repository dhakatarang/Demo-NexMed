const express = require("express");
const { medicinesDB, authDB } = require("../database/dbConnections");
const { authMiddleware } = require("../utils/authMiddleware");

const router = express.Router();

// Get all medicines (Public route - no auth required)
router.get("/all", (req, res) => {
  console.log('📍 GET /api/medicines/all - Fetching all medicines');
  
  medicinesDB.all(
    `SELECT m.*, u.name as user_name, u.email as user_email
     FROM medicines m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.quantity > 0
     ORDER BY m.created_at DESC`, 
    [], 
    (err, rows) => {
      if (err) {
        console.error('❌ Database error fetching medicines:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error while fetching medicines", 
          error: err.message 
        });
      }
      
      console.log(`✅ Found ${rows.length} medicines`);
      
      const medicines = rows.map(medicine => ({
        id: medicine.id,
        name: medicine.name,
        description: medicine.description,
        quantity: medicine.quantity,
        price: medicine.price,
        optionType: medicine.optionType,
        image: medicine.image,
        expiryDate: medicine.expiry_date,
        manufacturer: medicine.manufacturer,
        category: medicine.category,
        createdAt: medicine.created_at,
        updatedAt: medicine.updated_at,
        user: {
          id: medicine.user_id,
          name: medicine.user_name,
          email: medicine.user_email
        }
      }));

      res.json({ 
        success: true, 
        medicines: medicines,
        count: medicines.length,
        message: `Found ${medicines.length} medicines`
      });
    }
  );
});

// Get medicines by option type (donate/sell) - Public route
router.get("/type/:optionType", (req, res) => {
  const { optionType } = req.params;
  console.log(`📍 GET /api/medicines/type/${optionType} - Fetching medicines by type`);
  
  // Validate optionType
  if (!['donate', 'sell'].includes(optionType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid option type. Must be 'donate' or 'sell'"
    });
  }
  
  medicinesDB.all(
    `SELECT m.*, u.name as user_name, u.email as user_email
     FROM medicines m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.optionType = ? AND m.quantity > 0 
     ORDER BY m.created_at DESC`, 
    [optionType], 
    (err, rows) => {
      if (err) {
        console.error(`❌ Error fetching ${optionType} medicines:`, err);
        return res.status(500).json({ 
          success: false, 
          message: `Error fetching ${optionType} medicines`, 
          error: err.message 
        });
      }
      
      console.log(`✅ Found ${rows.length} ${optionType} medicines`);
      
      const medicines = rows.map(medicine => ({
        id: medicine.id,
        name: medicine.name,
        description: medicine.description,
        quantity: medicine.quantity,
        price: medicine.price,
        optionType: medicine.optionType,
        image: medicine.image,
        expiryDate: medicine.expiry_date,
        manufacturer: medicine.manufacturer,
        category: medicine.category,
        createdAt: medicine.created_at,
        updatedAt: medicine.updated_at,
        user: {
          id: medicine.user_id,
          name: medicine.user_name,
          email: medicine.user_email
        }
      }));

      res.json({ 
        success: true, 
        medicines: medicines,
        count: rows.length,
        optionType: optionType,
        message: `Found ${rows.length} ${optionType} medicines`
      });
    }
  );
});

// Buy medicine (reduce quantity) - Protected route
router.post("/buy/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { quantity = 1 } = req.body;
  const userId = req.userId;

  console.log(`📍 POST /api/medicines/buy/${id} - User ${userId} buying ${quantity} items`);

  // Validate quantity
  if (quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be greater than 0"
    });
  }

  // Start a transaction for atomic operations
  medicinesDB.get(
    "SELECT * FROM medicines WHERE id = ? AND quantity > 0", 
    [id], 
    (err, medicine) => {
      if (err) {
        console.error('❌ Database error finding medicine:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error while finding medicine", 
          error: err.message 
        });
      }
      
      if (!medicine) {
        console.log(`❌ Medicine ${id} not found or out of stock`);
        return res.status(404).json({ 
          success: false, 
          message: "Medicine not found or out of stock" 
        });
      }

      if (medicine.quantity < quantity) {
        console.log(`❌ Insufficient quantity. Available: ${medicine.quantity}, Requested: ${quantity}`);
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient quantity available. Only ${medicine.quantity} items left.` 
        });
      }

      // Check if user is trying to buy their own medicine
      if (medicine.user_id === userId) {
        return res.status(400).json({
          success: false,
          message: "You cannot buy your own listed medicine"
        });
      }

      const newQuantity = medicine.quantity - quantity;
      
      // Update medicine quantity
      medicinesDB.run(
        "UPDATE medicines SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [newQuantity, id],
        function(err) {
          if (err) {
            console.error('❌ Error updating medicine quantity:', err);
            return res.status(500).json({ 
              success: false, 
              message: "Error updating medicine quantity", 
              error: err.message 
            });
          }

          console.log(`✅ Medicine ${id} quantity updated from ${medicine.quantity} to ${newQuantity}`);

          // Also update donaterent table if exists
          const { donateRentDB } = require('../database/dbConnections');
          if (donateRentDB) {
            donateRentDB.run(
              "UPDATE donaterent SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND type = 'medicine'",
              [newQuantity, id],
              (err) => {
                if (err) {
                  console.error('⚠️ Error updating donaterent quantity:', err);
                } else {
                  console.log('✅ Updated donaterent table quantity');
                }
              }
            );
          }

          // Create purchase record (optional - for history)
          const purchaseDB = require('../database/dbConnections').purchaseDB;
          if (purchaseDB) {
            purchaseDB.run(
              `INSERT INTO purchases (medicine_id, buyer_id, seller_id, quantity, price, total_amount, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [id, userId, medicine.user_id, quantity, medicine.price, (medicine.price * quantity)],
              (err) => {
                if (err) {
                  console.error('⚠️ Error creating purchase record:', err);
                } else {
                  console.log('✅ Purchase record created');
                }
              }
            );
          }

          res.json({ 
            success: true, 
            message: "Purchase successful!",
            purchasedQuantity: quantity,
            remainingQuantity: newQuantity,
            medicine: {
              id: medicine.id,
              name: medicine.name,
              optionType: medicine.optionType,
              price: medicine.price,
              totalPaid: medicine.price * quantity
            }
          });
        }
      );
    }
  );
});

// Get user's medicines (Protected route)
router.get("/my-medicines", authMiddleware, (req, res) => {
  const userId = req.userId;
  console.log(`📍 GET /api/medicines/my-medicines - Fetching medicines for user ${userId}`);
  
  medicinesDB.all(
    `SELECT m.*, 
            (SELECT COUNT(*) FROM purchases WHERE medicine_id = m.id) as times_purchased
     FROM medicines m 
     WHERE m.user_id = ? 
     ORDER BY m.created_at DESC`, 
    [userId], 
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching user medicines:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching your medicines", 
          error: err.message 
        });
      }
      
      console.log(`✅ Found ${rows.length} medicines for user ${userId}`);
      
      res.json({ 
        success: true, 
        medicines: rows,
        count: rows.length,
        message: `Found ${rows.length} of your listed medicines`
      });
    }
  );
});

// Add new medicine (Protected route)
router.post("/add", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { 
    name, 
    description, 
    quantity, 
    price, 
    optionType, 
    image, 
    expiryDate, 
    manufacturer, 
    category 
  } = req.body;

  console.log(`📍 POST /api/medicines/add - User ${userId} adding new medicine`);

  // Validation
  if (!name || !quantity || !optionType) {
    return res.status(400).json({
      success: false,
      message: "Name, quantity, and option type are required"
    });
  }

  if (!['donate', 'sell'].includes(optionType)) {
    return res.status(400).json({
      success: false,
      message: "Option type must be 'donate' or 'sell'"
    });
  }

  if (optionType === 'sell' && (!price || price <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Price is required for selling and must be greater than 0"
    });
  }

  // Set price to 0 for donate items
  const finalPrice = optionType === 'donate' ? 0 : price;

  medicinesDB.run(
    `INSERT INTO medicines (
      name, description, quantity, price, optionType, image, 
      expiry_date, manufacturer, category, user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      name, description, quantity, finalPrice, optionType, image,
      expiryDate, manufacturer, category, userId
    ],
    function(err) {
      if (err) {
        console.error('❌ Error adding medicine:', err);
        return res.status(500).json({
          success: false,
          message: "Error adding medicine to database",
          error: err.message
        });
      }

      console.log(`✅ Medicine added successfully with ID: ${this.lastID}`);
      
      res.json({
        success: true,
        message: "Medicine added successfully!",
        medicineId: this.lastID,
        medicine: {
          id: this.lastID,
          name,
          description,
          quantity,
          price: finalPrice,
          optionType,
          image,
          expiryDate,
          manufacturer,
          category,
          userId
        }
      });
    }
  );
});

// Update medicine (Protected route - only owner can update)
router.put("/update/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { name, description, quantity, price, image, expiryDate, manufacturer, category } = req.body;

  console.log(`📍 PUT /api/medicines/update/${id} - User ${userId} updating medicine`);

  // First check if medicine exists and user owns it
  medicinesDB.get(
    "SELECT * FROM medicines WHERE id = ?",
    [id],
    (err, medicine) => {
      if (err) {
        console.error('❌ Error finding medicine:', err);
        return res.status(500).json({
          success: false,
          message: "Error finding medicine",
          error: err.message
        });
      }

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found"
        });
      }

      if (medicine.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own medicines"
        });
      }

      // Update medicine
      medicinesDB.run(
        `UPDATE medicines SET 
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          quantity = COALESCE(?, quantity),
          price = COALESCE(?, price),
          image = COALESCE(?, image),
          expiry_date = COALESCE(?, expiry_date),
          manufacturer = COALESCE(?, manufacturer),
          category = COALESCE(?, category),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, description, quantity, price, image, expiryDate, manufacturer, category, id],
        function(err) {
          if (err) {
            console.error('❌ Error updating medicine:', err);
            return res.status(500).json({
              success: false,
              message: "Error updating medicine",
              error: err.message
            });
          }

          console.log(`✅ Medicine ${id} updated successfully`);
          
          res.json({
            success: true,
            message: "Medicine updated successfully!",
            medicine: {
              id: parseInt(id),
              name: name || medicine.name,
              description: description || medicine.description,
              quantity: quantity || medicine.quantity,
              price: price || medicine.price,
              image: image || medicine.image,
              expiryDate: expiryDate || medicine.expiry_date,
              manufacturer: manufacturer || medicine.manufacturer,
              category: category || medicine.category
            }
          });
        }
      );
    }
  );
});

// Delete medicine (Protected route - only owner can delete)
router.delete("/delete/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  console.log(`📍 DELETE /api/medicines/delete/${id} - User ${userId} deleting medicine`);

  // First check if medicine exists and user owns it
  medicinesDB.get(
    "SELECT * FROM medicines WHERE id = ?",
    [id],
    (err, medicine) => {
      if (err) {
        console.error('❌ Error finding medicine:', err);
        return res.status(500).json({
          success: false,
          message: "Error finding medicine",
          error: err.message
        });
      }

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found"
        });
      }

      if (medicine.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own medicines"
        });
      }

      // Delete medicine
      medicinesDB.run(
        "DELETE FROM medicines WHERE id = ?",
        [id],
        function(err) {
          if (err) {
            console.error('❌ Error deleting medicine:', err);
            return res.status(500).json({
              success: false,
              message: "Error deleting medicine",
              error: err.message
            });
          }

          console.log(`✅ Medicine ${id} deleted successfully`);
          
          res.json({
            success: true,
            message: "Medicine deleted successfully!",
            deletedId: parseInt(id)
          });
        }
      );
    }
  );
});

// Search medicines (Public route)
router.get("/search", (req, res) => {
  const { q, category, optionType } = req.query;
  console.log(`📍 GET /api/medicines/search - Query: ${q}, Category: ${category}, Type: ${optionType}`);

  let query = `SELECT m.*, u.name as user_name FROM medicines m LEFT JOIN users u ON m.user_id = u.id WHERE m.quantity > 0`;
  let params = [];

  if (q) {
    query += ` AND (m.name LIKE ? OR m.description LIKE ? OR m.manufacturer LIKE ?)`;
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (category) {
    query += ` AND m.category = ?`;
    params.push(category);
  }

  if (optionType && ['donate', 'sell'].includes(optionType)) {
    query += ` AND m.optionType = ?`;
    params.push(optionType);
  }

  query += ` ORDER BY m.created_at DESC`;

  medicinesDB.all(query, params, (err, rows) => {
    if (err) {
      console.error('❌ Error searching medicines:', err);
      return res.status(500).json({
        success: false,
        message: "Error searching medicines",
        error: err.message
      });
    }

    console.log(`✅ Search found ${rows.length} medicines`);
    
    res.json({
      success: true,
      medicines: rows,
      count: rows.length,
      searchQuery: q,
      filters: { category, optionType }
    });
  });
});

// Test endpoint
router.get("/test", (req, res) => {
  console.log('📍 GET /api/medicines/test - Testing endpoint');
  res.json({ 
    success: true, 
    message: "Medicines API is working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      "GET /all": "Get all medicines (Public)",
      "GET /type/:optionType": "Get medicines by type (Public)",
      "GET /search": "Search medicines (Public)",
      "POST /buy/:id": "Buy medicine (Protected)",
      "GET /my-medicines": "Get user's medicines (Protected)",
      "POST /add": "Add new medicine (Protected)",
      "PUT /update/:id": "Update medicine (Protected)",
      "DELETE /delete/:id": "Delete medicine (Protected)"
    }
  });
});

module.exports = router;