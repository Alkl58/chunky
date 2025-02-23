const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { validUUID } = require('../utils/fileUtils');
const { UPLOAD_DIRECTORY } = require('../config');

const thumbnailRouter = express.Router();

// Thumbnail API
thumbnailRouter.get('/thumbnail/:bucketId/:fileId', async (req, res) => {
  const { bucketId, fileId } = req.params;
  const imagePath = path.join(UPLOAD_DIRECTORY, bucketId, fileId);

  if (!validUUID(bucketId)) {
    return res.status(404).send('Not a valid bucket-id');
  }

  if (!fs.existsSync(imagePath) || fileId.toLowerCase().endsWith('.json')) {
    return res.status(404).send('File not found');
  }

  try {
      // Generate thumbnail on the fly
      const thumbnailBuffer = await sharp(imagePath)
          .resize(260)
          .toBuffer();

      res.set('Content-Type', 'image/jpeg');
      res.send(thumbnailBuffer);
  } catch (error) {
      console.error('Thumbnail error:', error);
      res.status(500).send('Error generating thumbnail');
  }
});

module.exports = thumbnailRouter;
