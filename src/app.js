require('dotenv').config()
var capp = require("./common/index");
const commonRoutes = require("./common/routes/commonRoutes");
var { logger } = capp;
initApp(); 

function initApp() {
  let options={
    SERVER_PORT:'',
    LOGGING_MODE:'console (or) file' 
  };
  capp.initApp({}, (app) => {
    logger.info("Project builder has been initialised");
    onAfterInit(app);
  });
}

function onAfterInit(app) {
  app.get("/", (req, res) => {
    logger.info("hit /get route in main 1");
    logger.debug('debug mode')
    res.send("Hello World!");
  });
}
