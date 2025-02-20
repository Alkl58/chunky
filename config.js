const path = require('path');

module.exports = {
  UPLOAD_DIRECTORY: path.resolve(process.env.UPLOAD_DIRECTORY || path.join(__dirname, 'uploads')),
  PRIVATE_KEY: process.env.PRIVATE_KEY || 'defaultPrivateKey'
};

