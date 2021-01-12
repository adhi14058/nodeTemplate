var express = require("express");

module.exports.normalizedAPIs = (() => {
  var router = express.Router();
  router.get("/first", (req, res) => {
    print("/first hit - get route hit");
    res.send("hi");
  });
  return router;
})();

function print(text){
    console.log('[commonRoute.js] '+text)
}

