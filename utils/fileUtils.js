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

function initializeBucket(bucketId) {
  const bucketFolder = path.join(UPLOAD_DIRECTORY, bucketId);
  const bucketFiles = [];

  let bucketPassword = null;
  let expiration = null;
  let creationDate = null;

  // If folder doesn't exist, something seriously went wrong
  if (!fs.existsSync(bucketFolder)) {
    console.error("Tried to initialize bucket, however bucket folder doesn't exist. Could be file permission issues or a malicious user.");
    return false;
  }

  fs.readdirSync(bucketFolder).forEach(file => {
    if (!file.endsWith('.json') || file === 'bucket.json') {
      return;
    }

    const json = JSON.parse(fs.readFileSync(path.join(bucketFolder, file), 'utf8'));

    if (json['metadata']['password']) {
      bucketPassword = json['metadata']['password'];
    }

    expiration = json['metadata']['expiration'];
    creationDate = json['creation_date'];

    delete json['offset'];
    delete json['creation_date'];
    delete json['metadata']['bucketId'];
    delete json['metadata']['expiration'];
    delete json['metadata']['password'];

    bucketFiles.push(json);
  });

  let bucketData = {
    ...(bucketPassword !== null && { password: bucketPassword }),
    expiration: expiration,
    creationDate: creationDate,
    files: bucketFiles,
  };

  const bucketJSON = JSON.stringify(bucketData, null, 2);

  try {
    fs.writeFileSync(path.join(bucketFolder, 'bucket.json'), bucketJSON, 'utf8');
    console.debug(`Successfully initialized Bucket ${bucketId}`);
    return true;
  } catch (error) {
    console.error('Error writing bucket data to file', error);
  }

  return false;
}

function getBucketData(bucketId, jsonDataName) {
  const bucketFolder = path.join(UPLOAD_DIRECTORY, bucketId);
  const bucketJSONFile = path.join(bucketFolder, 'bucket.json');

  if (!fs.existsSync(bucketJSONFile)) {
    console.error(`Bucket json file not found! Trying to reinitialize...`);

    if (!initializeBucket(bucketId)) {
      return null;
    }
  }

  try {
    const json = JSON.parse(fs.readFileSync(bucketJSONFile, 'utf8'));
    return json[jsonDataName];
  } catch (err) {
    console.error(`Error reading bucket json file: ${err}`);
  }

  return null;
}

function getBucketFiles(bucketId) {
  return getBucketData(bucketId, 'files');
}

function getBucketPassword(bucketId) {
  return getBucketData(bucketId, 'password');
}

module.exports = { moveToBucketFolder, getBucketFiles, getBucketPassword, validUUID, initializeBucket };
