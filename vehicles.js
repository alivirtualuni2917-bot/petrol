// routes/vehicles.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/vehicleController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All vehicle routes require a valid JWT.
router.use(authMiddleware);

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', requireRole('admin'), ctrl.remove); // only admins can delete

module.exports = router;
