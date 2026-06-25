// controllers/vehicleController.js

const db = require('../config/db');

// ─── GET /api/vehicles ────────────────────────────────────
// Returns all active vehicles. Used by the Vehicles page and
// the Fuel Entry dropdown.
async function getAll(req, res, next) {
  try {
    const [rows] = await db.execute(
      'SELECT id, vehicle_number, driver_name, vehicle_type, status, created_at FROM vehicles ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/vehicles/:id ────────────────────────────────
async function getById(req, res, next) {
  try {
    const [rows] = await db.execute(
      'SELECT id, vehicle_number, driver_name, vehicle_type, status FROM vehicles WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/vehicles ───────────────────────────────────
async function create(req, res, next) {
  try {
    const { vehicle_number, driver_name, vehicle_type } = req.body;

    if (!vehicle_number || !driver_name || !vehicle_type) {
      return res.status(400).json({ success: false, message: 'vehicle_number, driver_name, and vehicle_type are required.' });
    }

    const [result] = await db.execute(
      'INSERT INTO vehicles (vehicle_number, driver_name, vehicle_type) VALUES (?, ?, ?)',
      [vehicle_number.trim(), driver_name.trim(), vehicle_type.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully.',
      data: { id: result.insertId, vehicle_number, driver_name, vehicle_type },
    });
  } catch (err) {
    // Duplicate vehicle number
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A vehicle with this number already exists.' });
    }
    next(err);
  }
}

// ─── PUT /api/vehicles/:id ────────────────────────────────
async function update(req, res, next) {
  try {
    const { vehicle_number, driver_name, vehicle_type, status } = req.body;

    if (!vehicle_number || !driver_name || !vehicle_type) {
      return res.status(400).json({ success: false, message: 'vehicle_number, driver_name, and vehicle_type are required.' });
    }

    const allowedStatus = ['active', 'inactive'];
    const safeStatus = allowedStatus.includes(status) ? status : 'active';

    const [result] = await db.execute(
      'UPDATE vehicles SET vehicle_number = ?, driver_name = ?, vehicle_type = ?, status = ? WHERE id = ?',
      [vehicle_number.trim(), driver_name.trim(), vehicle_type.trim(), safeStatus, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({ success: true, message: 'Vehicle updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A vehicle with this number already exists.' });
    }
    next(err);
  }
}

// ─── DELETE /api/vehicles/:id ─────────────────────────────
async function remove(req, res, next) {
  try {
    const [result] = await db.execute(
      'DELETE FROM vehicles WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
