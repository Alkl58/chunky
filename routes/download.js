const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { deleteFolder, deleteOneTimeDownload } = require('../utils/expiration');
const { getBucketPassword, validUUID } = require('../utils/fileUtils');
const { UPLOAD_DIRECTORY } = require('../config');

const downloadRouter = express.Router();

// File download with range support
downloadRouter.get('/download/:bucketId/:fileId', (req, res) => {
  const { bucketId, fileId } = req.params;
  const filePath = path.join(UPLOAD_DIRECTORY, bucketId, fileId);
  const metaFilePath = filePath + '.json';
  let contentType = 'application/octet-stream';
  let fileName = fileId;
  let isOneTime = false;

  if (!validUUID(bucketId)) {
    return res.status(404).send('Not a valid bucket-id');
  }

  if (!fs.existsSync(filePath) || fileId.toLowerCase().endsWith('.json')) {
    return res.status(404).send('File not found');
  }

  try {
    const metaData = JSON.parse(fs.readFileSync(metaFilePath, 'utf8'));
    contentType = metaData.metadata.filetype || 'application/octet-stream';
    fileName = metaData.metadata.filename || fileId;
    isOneTime = metaData.metadata.expiration === 'onetime';
  } catch (error) {
    console.error('Error reading metadata file:', error);
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  let rangeOptions = {};

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return res.status(416).send('Requested range not satisfiable');
    }

    res.status(206);
    res.set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
      'Content-Disposition': `filename="${fileName}"`,
    });

    rangeOptions = { start, end };
  } else {
    res.set({
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Content-Disposition': `filename="${fileName}"`,
    });
  }

  const fileStream = fs.createReadStream(filePath, rangeOptions);
  fileStream.pipe(res);

  fileStream.on('close', () => {
    if (isOneTime) {
      deleteOneTimeDownload(bucketId, fileId);
    }
  });
});

downloadRouter.get('/download-zip/:bucketId', (req, res) => {
  const { bucketId } = req.params;
  const password = req.query.p;
  const folderPath = path.join(UPLOAD_DIRECTORY, bucketId);

  if (!validUUID(bucketId)) {
    return res.status(404).send("Not a valid bucket-id");
  }

  if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
    return res.status(404).send("Bucket not found");
  }

  const bucketPassword = getBucketPassword(bucketId);
  if (bucketPassword && !password) {
    return res.status(401).send("Password required!");
  }

  if (bucketPassword && password !== bucketPassword) {
    return res.status(401).send("Password incorrect!");
  }

  // Set headers for ZIP download
  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${bucketId}.zip"`
  });

  // Create a ZIP archive and stream it
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', err => res.status(500).send({ error: err.message }));
  archive.pipe(res); // Stream archive to response

  let isOneTime = false;
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading directory');
    }

    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      if (fs.lstatSync(filePath).isFile() && !filePath.endsWith('.json')) {
        // Get file metadata
        const metaData = JSON.parse(fs.readFileSync(filePath + '.json', 'utf8'));
        isOneTime = metaData.metadata.expiration === 'onetime';

        // Add file to ZIP
        archive.file(filePath, { name: metaData.metadata.filename }); 
      }
    });

    archive.finalize(); // Finalize ZIP creation
  });

  // Delete bucket if one-time download
  res.on('finish', () => {
    if (isOneTime) {
      deleteFolder(bucketId);
    }
  });
});

module.exports = downloadRouter;
