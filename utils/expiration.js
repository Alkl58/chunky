const fs = require('fs');
const path = require('path');
const { UPLOAD_DIRECTORY } = require('../config');

function parseExpiration(expiration) {
  const match = expiration.match(/^(\d+)([hdwm])$/); // Match format like '6h', '30m', '10s'
  if (!match) throw new Error("Invalid expiration format");

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const unitMultipliers = {
    h: 1000 * 60 * 60, // hours to milliseconds
    d: 1000 * 60 * 60 * 24, // days to milliseconds
    w: 1000 * 60 * 60 * 24 * 7, // weeks to milliseconds
    m: 1000 * 60 * 60 * 24 * 7 * 4, // months to milliseconds
  };

  return value * unitMultipliers[unit];
}

function hasExpired(creationDate, expiration) {
  const creationTime = new Date(creationDate).getTime();
  const expirationMs = parseExpiration(expiration);
  const currentTime = Date.now();

  return currentTime > creationTime + expirationMs;
}

async function checkIfBucketIsExpired(bucketId) {
  const bucketJSONFile = path.join(UPLOAD_DIRECTORY, bucketId, 'bucket.json');

  try {
    // Check if the file exists
    await fs.promises.access(bucketJSONFile, fs.constants.F_OK);

    // Read and parse the file
    const data = await fs.promises.readFile(bucketJSONFile, 'utf8');
    const json = JSON.parse(data);

    const expiration = json['expiration'];
    const creationDate = json['creationDate'];

    if (expiration === 'never' || expiration === 'onetime') {
      return false;
    }

    return hasExpired(creationDate, expiration);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Bucket ${bucketId} json file doesn't exist!`);
    } else {
      console.error('Error reading bucket file:', err);
    }
  }

  return false;
}

async function deleteFolder(bucketId) {
  const bucketFolder = path.join(UPLOAD_DIRECTORY, bucketId);

  try {
    const files = await fs.promises.readdir(bucketFolder);

    for (const file of files) {
      const filePath = path.join(bucketFolder, file);
      await fs.promises.unlink(filePath); // Delete file
    }

    await fs.promises.rmdir(bucketFolder); // Remove the now-empty folder
    console.log(`Deleted bucket: ${bucketFolder}`);
  } catch (error) {
    console.error(`Error deleting bucket ${bucketFolder}:`, error);
  }
}

async function deleteExpiredBuckets() {
  const buckets = await fs.promises.opendir(UPLOAD_DIRECTORY)
  for await (const bucket of buckets) {
    if (!bucket.isDirectory()) {
      continue;
    }

    const expired = await checkIfBucketIsExpired(bucket.name);
    if (!expired) {
      continue;
    }

    console.log(`Bucket: ${bucket.name} expired!`);
    await deleteFolder(bucket.name);
  }
}

function deleteOneTimeDownload(bucketId, fileId) {
  const filePath = path.join(UPLOAD_DIRECTORY, bucketId, fileId);
  const bucketJSONFile = path.join(UPLOAD_DIRECTORY, bucketId, 'bucket.json');

  try {
    // Delete specified one-time download file
    fs.unlinkSync(filePath);
    fs.unlinkSync(filePath + '.json');

    const json = JSON.parse(fs.readFileSync(bucketJSONFile, 'utf8'));

    // Filter entry
    json.files = json.files.filter(file => file.id !== fileId);

    if (json.files.length === 0) {
      deleteFolder(bucketId);
      return;
    }

    // Overwrite bucket.json
    const bucketJSON = JSON.stringify(json, null, 2);
    fs.writeFileSync(bucketJSONFile, bucketJSON, 'utf8');
  } catch (err) {
    console.error('Error deleting files:', err);
  }
}

module.exports = { deleteExpiredBuckets, deleteFolder, deleteOneTimeDownload };
