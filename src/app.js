var capp= require('./common/index');
const commonRoutes = require('./common/routes/commonRoutes')
var {logger} = capp

initApp();

function initApp() {
  capp.initApp({'nonsslPort': 3050}, (app) => {
    console.log("Project builder has been initialised");
    onAfterInit(app);
  });
}

function onAfterInit(app) {
    app.get('/', (req, res) => {
        logger.info('hit / route in main 1')
        res.send('Hello World!')
    })
    app.use((req,res,next)=>{
        logger.info('============')
        logger.info(req.ip,req.hostname)
        logger.info('============')
        next()
    })
  }

