const path = require('path');

module.exports = {
  // Absolute path (example: /data for docker)
  UPLOAD_DIRECTORY: path.resolve(process.env.UPLOAD_DIRECTORY || path.join(__dirname, 'uploads')),
  PRIVATE_KEY: process.env.PRIVATE_KEY
};

