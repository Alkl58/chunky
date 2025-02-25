const jwt = require('jsonwebtoken');
const config = require('../config');

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
    console.error(`Invalid token ${token}!`, err);
    return res.status(401).send('Invalid token!');
  }
};

const verifyExpiration = (req, res, next) => {
  const expiration = req.headers['upload-metadata']
    .split(',')
    .filter(n => n.includes('expiration'));

  if (expiration.length == 0) {
    return res.status(500).json({ message: 'No expiration header found!' });
  }

  const expirationValue = atob(expiration[0].split(' ')[1]);
  if (! config.BUCKET_EXPIRATION.includes(expirationValue)) {
    return res.status(400).json({ message: 'Invalid Expiration value!' });
  }

  next();
}

const verifyFileSize = (req, res, next) => {
  console.log(req.headers['upload-metadata']);
  const size = req.headers['upload-length'];
  if (config.MAX_FILE_SIZE !== -1 && config.MAX_FILE_SIZE < Number(size)) {
    return res.status(400).send('File too big!');
  }
  next();
};

module.exports = { verifyToken, verifyFileSize, verifyExpiration };
