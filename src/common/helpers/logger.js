"use strict";
const winston = require("winston");
// const Redactyl = require('./redactyl');
require("winston-daily-rotate-file");
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, prettyPrint, printf, json, simple } = format;
const fs = require("fs");
const httpContext = require("express-http-context");
const rTracer = require("cls-rtracer");
const Redactyl = require("./redactyl");
const redactConfig = require("../config/redactConfig.json");
const redactyl = new Redactyl(redactConfig);

var winstonLogMode = process.env.LOGGING_MODE || "console";

var config = {
  directory: "logs",
  logLevel: process.env.LOG_LEVEL || "info",
  systemLogFile: "system.log",
  auditLogFile: "audit.log",
  winstonLogMessagesMode: winstonLogMode,
};

var logDir = process.cwd() + "/" + config.directory;
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const customFormat = printf((info) => {
  const rid = rTracer.id() || "unknown";
  var str = `[${
    info.timestamp
  }] [${info.level.toUpperCase()}]: [session-id: ${httpContext.get(
    "SessionId"
  )}] [correlation-id: ${rid}] ${info.message}`;
  if (info.meta) {
    str = str + JSON.stringify(info.meta);
  }
  if (info instanceof Error) str += " /--/ " + JSON.stringify(info.stack);
  return str;
});

var logger;

var loggerFormat = combine(timestamp(), json(), customFormat);
var loggerTransports = [];

if (winstonLogMode && winstonLogMode.includes("console")) {
  loggerTransports.push(
    new transports.Console({
      timestamp: true,
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        timestamp(),
        //customFormat
      ),
    })
  );
}

let logConfigOptions = {
  filename: "application-log-%DATE%.log",
  dirname: logDir,
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: false,
};

if (winstonLogMode && winstonLogMode.includes("file")) {
  loggerTransports.push(
    new winston.transports.DailyRotateFile(logConfigOptions)
  );
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
var colors = {
  error: "red blackBG",
  warn: "cyan blackBG",
  debug: "yellow blackBG", 
  info: "green blackBG",
};
winston.addColors(colors);
logger = createLogger({
  level: config.logLevel,
  format: loggerFormat,
  defaultMeta: { service: "builder" },
  transports: loggerTransports,
  exitOnError: false,
  levels: logLevels,
});

// function log() {
//     var totalResult = _.map(arguments, function(value) {
//         if (typeof value === 'object') {
//             value = JSON.stringify(redactyl.redact(value));
//         } else if (typeof value === 'string' && isJSON(value)) {
//             value = JSON.parse(value);
//             value = JSON.stringify(redactyl.redact(value));
//         }
//         return _.extend(value, ',');
//     });
//     logger.info(totalResult.join(','));
// }

// function info() {
//     var totalResult = _.map(arguments, function(value) {
//         if (typeof value === 'object') {
//             value = JSON.stringify(redactyl.redact(value));
//         } else if (typeof value === 'string' && isJSON(value)) {
//             value = JSON.parse(value);
//             value = JSON.stringify(redactyl.redact(value));
//         }
//         return _.extend(value, ',');
//     });

//     logger.info(totalResult.join(','));
// }

// function error() {
//     var totalResult = _.map(arguments, function(value) {
//         if (value instanceof Error)
//             logger.error(value);

//         if (typeof value === 'object') {
//             value = JSON.stringify(redactyl.redact(value));
//         } else if (typeof value === 'string' && isJSON(value)) {
//             value = JSON.parse(value);
//             value = JSON.stringify(redactyl.redact(value));
//         }
//         return _.extend(value, ',');
//     });
//     logger.error(totalResult.join(','));
// }

// function warn() {
//     var totalResult = _.map(arguments, function(value) {
//         if (typeof value === 'object') {
//             value = JSON.stringify(redactyl.redact(value));
//         } else if (typeof value === 'string' && isJSON(value)) {
//             value = JSON.parse(value);
//             value = JSON.stringify(redactyl.redact(value));
//         }
//         return _.extend(value, ',');
//     });
//     logger.warn(totalResult.join(','));
// }

// function debug() {
//     var totalResult = _.map(arguments, function(value) {
//         if (typeof value === 'object') {
//             value = JSON.stringify(redactyl.redact(value));
//         } else if (typeof value === 'string' && isJSON(value)) {
//             value = JSON.parse(value);
//             value = JSON.stringify(redactyl.redact(value));
//         }
//         return _.extend(value, ',');
//     });
//     logger.debug(totalResult.join(','));
// }

// function trace(){
//     var totalResult=_.map(arguments,function(value){
//         if (typeof value === 'object') {
//             value = JSON.stringify(redactyl.redact(value));
//         } else if (typeof value === 'string' && isJSON(value)) {
//             value = JSON.parse(value);
//             value = JSON.stringify(redactyl.redact(value));
//         }
//         return _.extend(value, ',');
//     });
//     logger.trace(totalResult.join(','));
// }

// function critical(){
//     var totalResult=_.map(arguments,function(value){
//         if (typeof value === 'object') {
//             value = JSON.stringify(redactyl.redact(value));
//         } else if (typeof value === 'string' && isJSON(value)) {
//             value = JSON.parse(value);
//             value = JSON.stringify(redactyl.redact(value));
//         }
//         return _.extend(value, ',');
//     });
//     logger.critical(totalResult.join(','));
// }

module.exports.logger = logger;
// module.exports.log = log;
// module.exports.info = info;
// module.exports.error = error;
// module.exports.warn = warn;
// module.exports.debug = debug;
// module.exports.trace = trace;
// module.exports.critical = critical;
module.exports.logLevels = logLevels;
