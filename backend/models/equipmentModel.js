// backend/models/equipmentModel.js
const { equipmentsDB } = require('../database/dbConnections');

const Equipment = {
  getAll: (cb) => equipmentsDB.all(`SELECT * FROM equipments ORDER BY id DESC`, [], cb),
  getById: (id, cb) => equipmentsDB.get(`SELECT * FROM equipments WHERE id = ?`, [id], cb),
  create: (name, description, quantity, condition, cb) => {
    equipmentsDB.run(`INSERT INTO equipments (name, description, quantity, condition) VALUES (?, ?, ?, ?)`,
      [name, description, quantity, condition], function(err) { cb(err, this ? this.lastID : null); });
  },
  update: (id, name, description, quantity, condition, cb) => {
    equipmentsDB.run(`UPDATE equipments SET name=?, description=?, quantity=?, condition=? WHERE id=?`,
      [name, description, quantity, condition, id], cb);
  },
  remove: (id, cb) => equipmentsDB.run(`DELETE FROM equipments WHERE id=?`, [id], cb)
};

module.exports = Equipment;
