// config/upload.js
// Multer configuration for fuel slip image uploads.

const multer  = require('multer');
const path    = require('path');
const crypto  = require('crypto');
const fs      = require('fs');

const UPLOAD_DIR      = process.env.UPLOAD_DIR    || 'uploads/slips';
const MAX_SIZE_MB     = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
const ALLOWED_TYPES   = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXT_MAP = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf' };

// Ensure the upload directory exists.
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),

  filename: (_req, file, cb) => {
    const ext      = ALLOWED_EXT_MAP[file.mimetype] || path.extname(file.originalname).toLowerCase();
    const unique   = crypto.randomBytes(8).toString('hex');
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    cb(null, `slip_${datePart}_${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
      'Only JPG, PNG, WEBP, and PDF files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = upload;
