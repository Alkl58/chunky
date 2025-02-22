const { Server, EVENTS } = require('@tus/server');
const { FileStore } = require('@tus/file-store');
const { verifyToken, verifyFileSize } = require('../middleware/uploadMiddleware');
const { moveToBucketFolder } = require('../utils/fileUtils');
const { UPLOAD_DIRECTORY } = require('../config');
const express = require('express');
const jwt = require('jsonwebtoken');

const uploadRouter = express.Router();

// Setup tus server
const tusServer = new Server({
  path: '/api/upload',
  datastore: new FileStore({ directory: UPLOAD_DIRECTORY }),
});

// Handle tus.io uploads
uploadRouter.all('/api/upload/*', [verifyToken], (req, res) => {
  tusServer.handle(req, res)
});

uploadRouter.all('/api/upload', [verifyToken, verifyFileSize], (req, res) => {
  tusServer.handle(req, res)
});

// Handle file upload event
tusServer.on(EVENTS.POST_FINISH, (req, res, upload) => {
  const token = req.headers['token'];
  const bucketId = upload.metadata.bucketId;
  if (!token || !bucketId) {
    console.error("No token or bucketId provided! This should never happen!\n" + upload);
    return;
  }

  try {
    var decoded = jwt.verify(token, process.env.PRIVATE_KEY);

    // Check if provided token matches the bucket id
    if (decoded.data === bucketId) {
      moveToBucketFolder(decoded.data, upload.id);
      return;
    }

    console.error(`BucketId: ${bucketId} does not match decoded token value: ${decoded.data}`);
  } catch (err) {
    console.error(`Invalid bucket id ${bucketId} - Deleting file!`);
  }
});

module.exports = uploadRouter;
