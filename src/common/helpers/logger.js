'use strict';
const winston = require('winston');
// const Redactyl = require('./redactyl');
require('winston-daily-rotate-file');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, prettyPrint, printf, json, simple } = format;
const fs = require('fs');
const httpContext = require('express-http-context');
const rTracer = require('cls-rtracer')
const Redactyl = require('./redactyl');
const redactConfig = require('../config/redactConfig.json');
const redactyl = new Redactyl(redactConfig);

var winstonLogMode = process.env.LOGGING_MODE;
if (!winstonLogMode)
    winstonLogMode = "console";

var config = {
    directory: "logs",
    logLevel: process.env.LOG_LEVEL || "info",
    systemLogFile: "system.log",
    auditLogFile: "audit.log",
    winstonLogMessagesMode: winstonLogMode,
};

var logDir = process.cwd() + "/" + config.directory;
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const customFormat = printf(info => {
    const rid = 'tr'//|rTracer.id()
    var str = `[${info.timestamp}] [${info.level.toUpperCase()}]: [session-id: ${httpContext.get("SessionId")}] [correlation-id: ${rid}] ${info.message}`;
    if (info.meta) {
        str = str + JSON.stringify(info.meta);
    }
    if(info instanceof Error)
        str += " /--/ " + JSON.stringify(info.stack);
    return str;
});

var auditLogger, logger;

var loggerFormat = combine(timestamp(), json(), customFormat);
var loggerTransports = [];
var auditLoggerTransports = [];

if (winstonLogMode && winstonLogMode.includes('console')) {
    loggerTransports.push(new transports.Console({timestamp: true, colorize: true})); 
   
    auditLoggerTransports.push(new transports.Console({timestamp: true, colorize: true}));
}


if (winstonLogMode && winstonLogMode.includes('file')) {
    // loggerTransports.push(new transports.File({
    //     name: 'system-log-file',
    //     filename: logDir + '/' + config.systemLogFile,
    //     timestamp: true,
    //     level: config.logLevel
    // }));
   
    // auditLoggerTransports.push(new transports.File({
    //     name: 'audit-log-file',
    //     filename: logDir + '/' + config.auditLogFile,
    //     level: config.logLevel,
    //     timestamp: true
    // }));

    const sys_log_rotate = JSON.parse(JSON.stringify(logconfig.config.components.logging));
    sys_log_rotate["filename"]= logDir + '/' + config.systemLogFile;
    loggerTransports.push(new (winston.transports.DailyRotateFile)(sys_log_rotate));

    const audit_log_rotate = JSON.parse(JSON.stringify(logconfig.config.components.logging));
    audit_log_rotate["filename"] = logDir + '/' + config.auditLogFile;
    auditLoggerTransports.push(new (winston.transports.DailyRotateFile)(audit_log_rotate));
    
}
var logLevels = {
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warn: 4,
    notice: 5,
    info: 6,
    debug: 7,
    trace: 8
};

logger = winston.createLogger({
    level: config.logLevel,
    format: loggerFormat,
    defaultMeta: { service: 'builder' },
    transports: loggerTransports,
    exitOnError: false,
    levels: logLevels
});

auditLogger = winston.createLogger({
    level: config.logLevel,
    format: loggerFormat,
    defaultMeta: { service: 'builder' },
    transports: auditLoggerTransports,
    exitOnError: false,
    levels: logLevels
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
module.exports.auditLogger = auditLogger;
// module.exports.log = log;
// module.exports.info = info;
// module.exports.error = error;
// module.exports.warn = warn;
// module.exports.debug = debug;
// module.exports.trace = trace;
// module.exports.critical = critical;
module.exports.logLevels= logLevels;
