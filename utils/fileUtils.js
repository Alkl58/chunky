const fs = require('fs');
const path = require('path');
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || 'uploads';

function moveToBucketFolder(bucketId, fileId) {   
    const targetFolder = path.join(UPLOAD_DIRECTORY, bucketId);

    try {
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder);
        }
    } catch (err) {
        console.error(err);
    }

    try {
        const sourceFile = path.join(__dirname, '../', UPLOAD_DIRECTORY, fileId);
        const targetFile = path.join(__dirname, '../', targetFolder, fileId);

        fs.renameSync(sourceFile, targetFile);
        fs.renameSync(sourceFile + '.json', targetFile + '.json');
    } catch (err) {
        console.error(err);
    }
}

function getBucketFiles(bucketId) {
    const bucketFolder = path.join(__dirname, '../', UPLOAD_DIRECTORY, bucketId);
    const bucketFiles = [];

    fs.readdirSync(bucketFolder).forEach(file => {
        if (!file.endsWith('.json')) {
            return;
        }

        const json = JSON.parse(fs.readFileSync(path.join(bucketFolder, file), 'utf8'));

        // delete information
        delete json['creation_date'];

        bucketFiles.push(json);
    });

    return bucketFiles;
}

module.exports = { moveToBucketFolder, getBucketFiles };
