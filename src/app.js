const config = require("./config");
var capp = require("./common");
var { logger } = capp.logger("server.js");

function startServer() {
	capp.initApp(config, (app) => {
		logger.info("Data Server has been initialized !");
		onAfterInit(app);
	});
}
startServer();

function onAfterInit(app) {
	app.get("/", (req, res) => {
		logger.info("hit /get route in main 1");
		logger.debug("debug mode");
		res.send("Hello World!");
	});
}
