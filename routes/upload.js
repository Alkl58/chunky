const { Server, EVENTS } = require('@tus/server');
const { FileStore } = require('@tus/file-store');
const { moveToBucketFolder } = require('../utils/fileUtils');
const { UPLOAD_DIRECTORY, MAX_FILE_SIZE } = require('../config');
const express = require('express');
const jwt = require('jsonwebtoken');

const uploadRouter = express.Router();

// Setup tus server
const tusServer = new Server({
    path: '/api/upload',
    datastore: new FileStore({ directory: UPLOAD_DIRECTORY }),
});

// Middleware for token verification
const verifyToken = (req, res, next) => {
    const token = req.headers['token'];

    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    try {
        jwt.verify(token, process.env.PRIVATE_KEY);
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        console.error(`Invalid token ${token}!`);
        return res.status(401).send('Invalid token!');
    }
};

const verifyFileSize = (req, res, next) => {
    const size = req.headers['upload-length'];
    if (MAX_FILE_SIZE !== 1 && MAX_FILE_SIZE < Number(size)) {
        return res.status(400).send('File too big!');
    }
    next();
};

// Handle tus.io uploads
uploadRouter.all('/api/upload/*', verifyToken, (req, res) => {
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
