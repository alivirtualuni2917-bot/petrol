// middleware/errorHandler.js
// Central error-handling middleware — must be the LAST app.use() in server.js.

const multer = require('multer');

function errorHandler(err, req, res, _next) {
  // Multer upload errors
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 10} MB.`
      : err.message;
    return res.status(400).json({ success: false, message: msg });
  }

  // Custom application errors
  if (err.status) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  // Unexpected errors — log but don't leak internals
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
}

module.exports = errorHandler;
