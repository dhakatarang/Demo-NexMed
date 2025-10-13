const express = require("express");
const { equipmentsDB } = require("../database/dbConnections");

const router = express.Router();

// Get all medical equipment
router.get("/all", (req, res) => {
  equipmentsDB.all(
    "SELECT * FROM equipments ORDER BY created_at DESC", 
    [], 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching equipment", 
          error: err.message 
        });
      }
      res.json({ 
        success: true, 
        equipments: rows,
        count: rows.length 
      });
    }
  );
});

// Get equipment by option type (donate/sell/rent)
router.get("/type/:optionType", (req, res) => {
  const { optionType } = req.params;
  
  equipmentsDB.all(
    "SELECT * FROM equipments WHERE optionType = ? ORDER BY created_at DESC", 
    [optionType], 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching equipment", 
          error: err.message 
        });
      }
      res.json({ 
        success: true, 
        equipments: rows,
        count: rows.length 
      });
    }
  );
});

// Buy/Rent equipment
router.post("/action/:id", (req, res) => {
  const { id } = req.params;
  const { action, quantity = 1 } = req.body;

  equipmentsDB.get(
    "SELECT * FROM equipments WHERE id = ?", 
    [id], 
    (err, row) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error finding equipment", 
          error: err.message 
        });
      }
      if (!row) {
        return res.status(404).json({ 
          success: false, 
          message: "Equipment not found" 
        });
      }

      if (row.quantity < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: "Insufficient quantity available" 
        });
      }

      const newQuantity = row.quantity - quantity;
      
      equipmentsDB.run(
        "UPDATE equipments SET quantity = ? WHERE id = ?",
        [newQuantity, id],
        function(err) {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: "Error updating quantity", 
              error: err.message 
            });
          }
          res.json({ 
            success: true, 
            message: `${action} successful`,
            remainingQuantity: newQuantity,
            action: action
          });
        }
      );
    }
  );
});

module.exports = router;