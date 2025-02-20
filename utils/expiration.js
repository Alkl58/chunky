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
  const bucketFolder = path.join(UPLOAD_DIRECTORY, bucketId);

  try {
    const files = await fs.promises.readdir(bucketFolder);

    for (const file of files) {
      if (!file.endsWith('.json')) {
        continue;
      }

      const filePath = path.join(bucketFolder, file);
      const data = await fs.promises.readFile(filePath, 'utf8');
      const json = JSON.parse(data);

      const expiration = json['metadata']['expiration'];
      const creationDate = json['creation_date'];

      if (expiration === 'never') {
        return false;
      }

      return hasExpired(creationDate, expiration);
    }
  } catch (error) {
    console.error('Error reading bucket folder:', error);
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
      console.log(`Bucket: ${bucket.name} not expired!`);
      continue;
    }

    console.log(`Bucket: ${bucket.name} expired!`);
    await deleteFolder(bucket.name);
  }
}

module.exports = { deleteExpiredBuckets };
