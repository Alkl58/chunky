const config = require("../config");

const checkUploadPassword = (req, res, next) => {
  if (config.UPLOAD_PASSWORD && !req.headers['chunky-auth']) {
    return res.json("Password required!");
  }

  if (config.UPLOAD_PASSWORD && req.headers['chunky-auth'] !== config.UPLOAD_PASSWORD) {
    return res.json("Password incorrect!");
  }

  next();
};

module.exports = checkUploadPassword;
