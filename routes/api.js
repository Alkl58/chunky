const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config');
const checkUploadPassword = require("../middleware/authMiddleware");
const { getBucketFiles, getBucketPassword } = require('../utils/fileUtils');
const { UPLOAD_DIRECTORY } = require('../config');

const router = express.Router();

// Retrieve all files from a bucket
router.get('/api/bucket/:bucketId', (req, res) => {
  const bucketId = req.params.bucketId;

  if (bucketId.length !== 36) {
    return res.json("Not a valid bucket-id");
  }

  const bucketFolder = path.join(UPLOAD_DIRECTORY, bucketId);
  if (!fs.existsSync(bucketFolder)) {
    return res.json("Bucket not found!");
  }

  const bucketPassword = getBucketPassword(bucketId);
  if (bucketPassword && !req.headers['chunky-bucket-auth']) {
    return res.json("Password required!");
  }

  if (bucketPassword && req.headers['chunky-bucket-auth'] !== bucketPassword) {
    return res.json("Password incorrect!");
  }

  res.json({
    bucketId,
    files: getBucketFiles(bucketId)
  });
});

router.get('/api/generate-bucket', [checkUploadPassword], (req, res) => {
  var bucketId = crypto.randomUUID();
  while (fs.existsSync(path.join(UPLOAD_DIRECTORY, bucketId))) {
    // Highly unlikely
    bucketId = crypto.randomUUID();
  }

  // Create signed token
  var token = jwt.sign({ data: bucketId }, process.env.PRIVATE_KEY, { expiresIn: '12h' });
  res.json({ token, bucketId });
});

router.get('/api/config', [checkUploadPassword], (req, res) => {
  res.json({
    MAX_FILE_SIZE: config.MAX_FILE_SIZE,
    MAX_BUCKET_SIZE: config.MAX_BUCKET_SIZE,
  });
});

module.exports = router;
