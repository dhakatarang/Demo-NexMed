// backend/models/medicineModel.js
const { medicinesDB } = require('../database/dbConnections');

const Medicine = {
  getAll: (cb) => medicinesDB.all(`SELECT * FROM medicines ORDER BY id DESC`, [], cb),
  getById: (id, cb) => medicinesDB.get(`SELECT * FROM medicines WHERE id = ?`, [id], cb),
  create: (name, description, quantity, expiryDate, cb) => {
    medicinesDB.run(`INSERT INTO medicines (name, description, quantity, expiryDate) VALUES (?, ?, ?, ?)`,
      [name, description, quantity, expiryDate], function(err) { cb(err, this ? this.lastID : null); });
  },
  update: (id, name, description, quantity, expiryDate, cb) => {
    medicinesDB.run(`UPDATE medicines SET name=?, description=?, quantity=?, expiryDate=? WHERE id=?`,
      [name, description, quantity, expiryDate, id], cb);
  },
  remove: (id, cb) => medicinesDB.run(`DELETE FROM medicines WHERE id=?`, [id], cb)
};

module.exports = Medicine;
