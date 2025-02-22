const express = require('express');
const path = require('path');
const webRouter = express.Router();

// Static files
webRouter.get('/assets/*', express.static(path.join(__dirname, '../public')));
webRouter.get('/*', express.static(path.join(__dirname, '../public')));

// Main page
webRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

webRouter.get('/bucket/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = webRouter;
