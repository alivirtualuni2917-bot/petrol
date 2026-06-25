// routes/fuelEntries.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/fuelController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload  = require('../config/upload');

// All fuel-entry routes require a valid JWT.
router.use(authMiddleware);

router.get('/stats',  ctrl.dashboardStats);          // GET /api/fuel-entries/stats
router.get('/',       ctrl.getAll);                  // GET /api/fuel-entries?search=&vehicle_id=&date=
router.get('/:id',    ctrl.getById);                 // GET /api/fuel-entries/:id

// upload.single('slip_image') processes the multipart form file field named "slip_image"
router.post('/',      upload.single('slip_image'), ctrl.create);  // POST /api/fuel-entries
router.put('/:id',    upload.single('slip_image'), ctrl.update);  // PUT  /api/fuel-entries/:id
router.delete('/:id', requireRole('admin'), ctrl.remove);         // DELETE — admin only

module.exports = router;
