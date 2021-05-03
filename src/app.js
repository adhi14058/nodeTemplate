const config = require("./config");
var capp = require("./common");
var { logger } = capp.logger("server.js");
let authRoute = require('./modules/user/route')
function startServer() {
	capp.initApp(config, (app) => {
		logger.info("Data Server has been initialized !");
		onAfterInit(app);
	});
}
startServer();

function onAfterInit(app) {
	app.get("/auth", authRoute);
}
