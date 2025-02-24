const path = require('path');

module.exports = {
  // Required
  PRIVATE_KEY: process.env.PRIVATE_KEY,

  // Enables admin page
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? null,

  // Absolute path (example: /data for docker)
  UPLOAD_DIRECTORY: path.resolve(process.env.UPLOAD_DIRECTORY || path.join(__dirname, 'uploads')),

  // Upload password protection 
  UPLOAD_PASSWORD: process.env.UPLOAD_PASSWORD ?? "",

  // Limit max size in bytes (-1 = no limits)
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE 
    ? parseInt(process.env.MAX_FILE_SIZE) 
    : -1, // example 20MB: Math.pow(2, 20) * 20

  MAX_BUCKET_SIZE: process.env.MAX_BUCKET_SIZE 
    ? parseInt(process.env.MAX_BUCKET_SIZE) 
    : -1, // example  2GB: Math.pow(2, 30) * 2
};

