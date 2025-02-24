const express = require('express');
const path = require('path');
const fs = require('fs');
const { deleteFolder } = require('../utils/expiration');
const { getBucketFiles, getBucketPassword, getBucketSize } = require('../utils/fileUtils');
const { ADMIN_PASSWORD, UPLOAD_DIRECTORY } = require('../config');

const adminRouter = express.Router();

adminRouter.get('/api/admin', (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(404).send("<div>404 Not Found</div>");
  }

  if (!req.headers['chunky-admin-auth']) {
    return res.json("Password required!");
  }

  if (req.headers['chunky-admin-auth'] !== ADMIN_PASSWORD) {
    return res.json("Password incorrect!");
  }

  const folders = fs.readdirSync(UPLOAD_DIRECTORY);
  let buckets = [];

  folders.forEach(folderName => {
    const folderPath = path.join(UPLOAD_DIRECTORY, folderName);

    if(!fs.lstatSync(folderPath).isDirectory()) {
      return;
    }

    buckets.push({
      bucketId: folderName,
      bucketSize: getBucketSize(folderName),
      password: getBucketPassword(folderName),
      files: getBucketFiles(folderName)
    });
  });

  res.json(buckets);
});

adminRouter.post('/api/admin', async (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(404).send("<div>404 Not Found</div>");
  }

  if (!req.headers['chunky-admin-auth']) {
    return res.status(401).json({message: "Password required!"});
  }

  if (req.headers['chunky-admin-auth'] !== ADMIN_PASSWORD) {
    return res.status(401).json({message: "Password incorrect!"});
  }

  const { bucketId } = req.body;
  if (!bucketId) {
    return res.status(500).json({message: "Bucket required!"});
  }

  await deleteFolder(bucketId);

  res.json({message: 'Success... maybe.'});
});

module.exports = adminRouter;
