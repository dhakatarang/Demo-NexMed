const express = require("express");
const { authDB, profileDB } = require("../database/dbConnections");
const { authMiddleware } = require("../utils/authMiddleware");

const router = express.Router();

// Get current user's profile
router.get("/me", authMiddleware, (req, res) => {
  const userId = req.userId;

  authDB.get(
    `SELECT id, name, email, user_type, medical_license_path, created_at 
     FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        console.error('❌ Error fetching user profile:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching profile", 
          error: err.message 
        });
      }

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      // Get additional profile info if exists
      profileDB.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [userId],
        (err, profile) => {
          if (err) {
            console.error('Error fetching profile details:', err);
          }

          const userData = {
            ...user,
            phone: profile?.phone || '',
            address: profile?.address || '',
            date_of_birth: profile?.date_of_birth || '',
            emergency_contact: profile?.emergency_contact || '',
            medical_history: profile?.medical_history || ''
          };

          res.json(userData);
        }
      );
    }
  );
});

// Update user profile
router.put("/update", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { name, phone, address, date_of_birth, emergency_contact, medical_history } = req.body;

  // Start a transaction for updating both users and profiles table
  authDB.serialize(() => {
    // Update users table
    if (name) {
      authDB.run(
        "UPDATE users SET name = ? WHERE id = ?",
        [name, userId],
        function(err) {
          if (err) {
            console.error('❌ Error updating user:', err);
            return res.status(500).json({ 
              success: false, 
              message: "Error updating profile", 
              error: err.message 
            });
          }
        }
      );
    }

    // Check if profile exists
    profileDB.get(
      "SELECT * FROM profiles WHERE user_id = ?",
      [userId],
      (err, existingProfile) => {
        if (err) {
          console.error('Error checking profile:', err);
        }

        if (existingProfile) {
          // Update existing profile
          profileDB.run(
            `UPDATE profiles SET 
             phone = ?, address = ?, date_of_birth = ?, 
             emergency_contact = ?, medical_history = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = ?`,
            [phone, address, date_of_birth, emergency_contact, medical_history, userId],
            function(err) {
              if (err) {
                console.error('❌ Error updating profile:', err);
                return res.status(500).json({ 
                  success: false, 
                  message: "Error updating profile details", 
                  error: err.message 
                });
              }

              // Return updated user data
              sendUpdatedUserData(userId, res);
            }
          );
        } else {
          // Create new profile
          profileDB.run(
            `INSERT INTO profiles 
             (user_id, phone, address, date_of_birth, emergency_contact, medical_history) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, phone, address, date_of_birth, emergency_contact, medical_history],
            function(err) {
              if (err) {
                console.error('❌ Error creating profile:', err);
                return res.status(500).json({ 
                  success: false, 
                  message: "Error creating profile", 
                  error: err.message 
                });
              }

              // Return updated user data
              sendUpdatedUserData(userId, res);
            }
          );
        }
      }
    );
  });
});

// Helper function to send updated user data
const sendUpdatedUserData = (userId, res) => {
  authDB.get(
    `SELECT id, name, email, user_type, medical_license_path, created_at 
     FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching updated profile" 
        });
      }

      profileDB.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [userId],
        (err, profile) => {
          if (err) {
            console.error('Error fetching profile details:', err);
          }

          const userData = {
            ...user,
            phone: profile?.phone || '',
            address: profile?.address || '',
            date_of_birth: profile?.date_of_birth || '',
            emergency_contact: profile?.emergency_contact || '',
            medical_history: profile?.medical_history || ''
          };

          res.json({
            success: true,
            message: "Profile updated successfully",
            user: userData
          });
        }
      );
    }
  );
};

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Profile API is working!",
    endpoints: {
      "GET /me": "Get current user profile (Protected)",
      "PUT /update": "Update user profile (Protected)"
    }
  });
});

module.exports = router;