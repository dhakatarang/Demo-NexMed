// backend/controllers/donaterentController.js
const DonateRent = require('../models/donaterentModel');
const Medicine = require('../models/medicineModel');
const Equipment = require('../models/equipmentModel');

const create = (req, res) => {
  // expected: { userId, itemType: 'medicine'|'equipment', itemData }
  const { userId, itemType, itemData } = req.body;
  if (!userId || !itemType || !itemData) return res.status(400).json({ error: 'Missing fields' });

  // Insert into respective table then create donaterent record
  if (itemType === 'medicine') {
    Medicine.create(itemData.name, itemData.description, itemData.quantity || 1, itemData.expiryDate || null, (err, itemId) => {
      if (err) return res.status(500).json({ error: err.message });
      DonateRent.create(userId, itemType, itemId, (err2, id) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Donated medicine recorded', donateId: id, itemId });
      });
    });
  } else if (itemType === 'equipment') {
    Equipment.create(itemData.name, itemData.description, itemData.quantity || 1, itemData.condition || 'good', (err, itemId) => {
      if (err) return res.status(500).json({ error: err.message });
      DonateRent.create(userId, itemType, itemId, (err2, id) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Donated equipment recorded', donateId: id, itemId });
      });
    });
  } else {
    res.status(400).json({ error: 'Invalid itemType' });
  }
};

const list = (req, res) => {
  DonateRent.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

module.exports = { create, list };
