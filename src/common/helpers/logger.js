"use strict";
const winston = require("winston");
require("winston-daily-rotate-file");
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, prettyPrint, printf, json, splat } = format;
const fs = require("fs");
const path = require("path");
const { isObject } = require("lodash");
const httpContext = require("express-http-context");

var winstonLogMode = process.env.LOGGING_MODE || "console file";

var config = {
	directory: "logs",
	logLevel: process.env.LOG_LEVEL || "info",
	systemLogFile: "system.log",
	auditLogFile: "audit.log",
	winstonLogMessagesMode: winstonLogMode,
};

var logDir = process.cwd() + "/" + config.directory;
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function formatObject(param) {
	if (isObject(param)) {
		return JSON.stringify(param);
	}
	return param;
}

const customFormat = printf((info) => {
	const rid = httpContext.get("CorrelationId") || "App Start"; //rTracer.id() ||
	var str = `[${info.timestamp}] [${info.level.toUpperCase()}] [${info.label}] [correlation-id: ${rid}]: \t\t ${formatObject(
		info.message
	)}`;
	if (info.meta) {
		str = str + JSON.stringify(info.meta);
	}
	if (info instanceof Error) str += " /--/ " + JSON.stringify(info.stack);
	return str;
});

var logger;

var loggerFormat = (fileName) =>
	combine(label({ label: fileName }), splat(), json(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat);
var loggerTransports = [];

if (winstonLogMode && winstonLogMode.includes("console")) {
	loggerTransports.push(
		new transports.Console({
			timestamp: true,
			handleExceptions: true,
			format: format.combine(),
		})
	);
}

let logConfigOptions = {
	filename: "application-log-%DATE%.log",
	dirname: logDir,
	datePattern: "YYYY-MM-DD-HH",
	handleExceptions: true,
	zippedArchive: false,
};

if (winstonLogMode && winstonLogMode.includes("file")) {
	loggerTransports.push(new winston.transports.DailyRotateFile(logConfigOptions));
}
var logLevels = {
	emergency: 0,
	alert: 1,
	critical: 2,
	error: 3,
	warn: 4,
	notice: 5,
	debug: 6,
	info: 7,
};

logger = (file = "data server default.js") => {
	let logger = createLogger({
		level: config.logLevel,
		format: loggerFormat(file),
		defaultMeta: { service: "Demo Data Server" },
		transports: loggerTransports,
		exitOnError: false,
		levels: logLevels,
	});
	console.log = logger.debug.bind(logger);
	console.info = logger.info.bind(logger);
	console.error = logger.error.bind(logger);
	console.warn = logger.warn.bind(logger);
	console.debug = logger.debug.bind(logger);
	return { logger };
};

module.exports = logger;
