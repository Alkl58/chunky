const express = require('express');
const path = require('path');
const { ADMIN_PASSWORD } = require('../config');

const webRouter = express.Router();

// Static files
webRouter.get('/assets/*', express.static(path.join(__dirname, '../public')));
webRouter.get('/*', express.static(path.join(__dirname, '../public')));

// Main page
webRouter.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, '../public/index.html'));
});

webRouter.get('/bucket/*', (req, res) => {
  return res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Admin page
webRouter.get('/admin', (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(404).send("<div>404 Not Found</div>");
  }
  return res.sendFile(path.join(__dirname, '../public/index.html'));
});

webRouter.get('*', (req, res) => {
  return res.status(404).send("<div>404 Not Found</div>");
});

module.exports = webRouter;
