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

const verifyFileSize = (req, res, next) => {
  const size = req.headers['upload-length'];
  if (config.MAX_FILE_SIZE !== -1 && config.MAX_FILE_SIZE < Number(size)) {
    return res.status(400).send('File too big!');
  }
  next();
};

module.exports = { verifyToken, verifyFileSize };
