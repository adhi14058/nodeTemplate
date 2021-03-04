"use strict";
const express = require("express");
const cors = require("cors");
var expressWinston = require("express-winston");
const httpContext = require("express-http-context");
const { v4: uuidv4 } = require("uuid");
const { errorHandler, errorConverter } = require("./helpers/errorHandler");
const { logger } = require("./helpers/logger")("common_index.js");
const ExportLogger = require("./helpers/logger");
const ApiError = require("./helpers/ApiError");
const pick = require("./helpers/pick");
const catchAsync = require("./helpers/catchAsync");
const mongoHelper = require("./helpers/mongoDB");
async function initApp(config, onAfterInit) {
	await mongoHelper.initDb(config.mongoose);
	var nonSslPort = normalizePort(config.port);
	var app = express();
	app.use(cors());
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	app.enable("trust proxy");
	app.use(httpContext.middleware);
	app.use((req, res, next) => {
		let CorrelationId = req.headers["correlation-id"] ? req.headers["correlation-id"] : uuidv4();
		httpContext.set("CorrelationId", CorrelationId);
		next();
	});
	// app.use(rTracer.expressMiddleware())
	app.use(
		expressWinston.logger({
			winstonInstance: logger,
			meta: true, // optional: control whether you want to log the meta data about the request (default to true)
			requestWhitelist: ["url", "method", "httpVersion", "originalUrl", "query"], // optional: control which properties of the request are logged
			dynamicMeta: function (req, res) {
				return {
					application: "Demo",
					protocol: req.protocol,
					clientIP: req.headers["x-forwarded-for"],
				};
			},
			// ignoredRoutes: ["/"], // Array of paths to ignore/skip logging. Overrides global ignoredRoutes for this instance
			msg: "HTTP {{req.method}} {{req.url}} ", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
			expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
			colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
			//ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
		})
	);

	onAfterInit(app);

	app.use((req, res, next) => {
		next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
	});

	app.use(errorConverter);
	app.use(errorHandler);

	app.listen(nonSslPort, () => {
		logger.info("running on port " + nonSslPort);
	});
}

function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) return val;
	if (port >= 0) return port;
	return false;
}

module.exports = {
	initApp: initApp,
	logger: ExportLogger,
	pick,
	catchAsync,
	ApiError,
};
