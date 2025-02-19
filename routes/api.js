const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const { getBucketFiles, getBucketPassword } = require('../utils/fileUtils');

const router = express.Router();
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || 'uploads';

// Retrieve all files from a bucket
router.get('/api/bucket/:bucketId', (req, res) => {
    const bucketId = req.params.bucketId;

    if (bucketId.length !== 36) {
        return res.json("Not a valid bucket-id");
    }

    const bucketFolder = path.join(__dirname, '../', UPLOAD_DIRECTORY, bucketId);
    if (!fs.existsSync(bucketFolder)) { 
        return res.json("Bucket not found!");
    }

    const bucketPassword = getBucketPassword(bucketId);
    if (bucketPassword && ! req.headers['chunky-bucket-auth']) {
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

router.get('/api/generate-bucket', (req, res) => {
    var bucketId = crypto.randomUUID();
    while (fs.existsSync(path.join(__dirname, '../', UPLOAD_DIRECTORY, bucketId))) {
        // Highly unlikely
        bucketId = crypto.randomUUID();
    }

    // Create signed token
    var token = jwt.sign({ data: bucketId }, process.env.PRIVATE_KEY, { expiresIn: '12h' });
    res.json({token, bucketId});
})

module.exports = router;
