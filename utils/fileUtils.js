const fs = require('fs');
const path = require('path');
const { UPLOAD_DIRECTORY } = require('../config');

function validUUID(uuid) {
  const pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return pattern.test(uuid);
}

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
    const sourceFile = path.join(UPLOAD_DIRECTORY, fileId);
    const targetFile = path.join(targetFolder, fileId);

    fs.renameSync(sourceFile, targetFile);
    fs.renameSync(sourceFile + '.json', targetFile + '.json');
  } catch (err) {
    console.error(err);
  }
}

function getBucketFiles(bucketId) {
  const bucketFolder = path.join(UPLOAD_DIRECTORY, bucketId);
  const bucketFiles = [];

  fs.readdirSync(bucketFolder).forEach(file => {
    if (!file.endsWith('.json')) {
      return;
    }

    const json = JSON.parse(fs.readFileSync(path.join(bucketFolder, file), 'utf8'));

    // delete information
    delete json['creation_date'];
    delete json['metadata']['password'];

    bucketFiles.push(json);
  });

  return bucketFiles;
}

function getBucketPassword(bucketId) {
  const bucketFolder = path.join(UPLOAD_DIRECTORY, bucketId);

  var password = null;
  fs.readdirSync(bucketFolder).forEach(file => {
    if (!file.endsWith('.json')) {
      return;
    }

    const json = JSON.parse(fs.readFileSync(path.join(bucketFolder, file), 'utf8'))['metadata'];
    if (json['password']) {
      password = json['password'];
    }
  });

  return password;
}

module.exports = { moveToBucketFolder, getBucketFiles, getBucketPassword, validUUID };
