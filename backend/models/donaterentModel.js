// backend/models/donaterentModel.js
const { donateRentDB } = require('../database/dbConnections');

const DonateRent = {
  create: (userId, itemType, itemId, cb) => {
    const createdAt = new Date().toISOString();
    donateRentDB.run(`INSERT INTO donaterent (userId, itemType, itemId, createdAt) VALUES (?, ?, ?, ?)`,
      [userId, itemType, itemId, createdAt], function(err) { cb(err, this ? this.lastID : null); });
  },
  getAll: (cb) => donateRentDB.all(`SELECT * FROM donaterent ORDER BY id DESC`, [], cb)
};

module.exports = DonateRent;
