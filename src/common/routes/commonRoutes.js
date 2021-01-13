var express = require("express");
const {logger} = require('../helpers/logger');
module.exports.normalizedAPIs = (() => {
  var router = express.Router();
  router.get("/first", (req, res) => {
    logger.warn("/first hit - get route hit");
    res.send("hi");
  });
  return router;
})();

