const express = require('express');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIRECTORY } = require('../config');

const downloadRouter = express.Router();

// File download with range support
downloadRouter.get('/download/:bucketId/:fileId', (req, res) => {
    const { bucketId, fileId } = req.params;
    const filePath = path.join(UPLOAD_DIRECTORY, bucketId, fileId);
    const metaFilePath = filePath + '.json';

    if (!fs.existsSync(filePath) || fileId.toLowerCase().endsWith('.json')) {
        return res.status(404).send('File not found');
    }

    let contentType = 'application/octet-stream';
    if (fs.existsSync(metaFilePath)) {
        try {
            const metaData = JSON.parse(fs.readFileSync(metaFilePath, 'utf8'));
            if (metaData.metadata.filetype) {
                contentType = metaData.metadata.filetype;
            }
        } catch (error) {
            console.error('Error reading metadata file:', error);
        }
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

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
            'Content-Type': contentType
        });

        const fileStream = fs.createReadStream(filePath, { start, end });
        fileStream.pipe(res);
    } else {
        res.set({
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes'
        });

        fs.createReadStream(filePath).pipe(res);
    }
});

module.exports = downloadRouter;
