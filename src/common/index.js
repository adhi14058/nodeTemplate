const express = require('express')
// const cluster = require('cluster');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const util = require('util');
var expressWinston = require('express-winston');
const httpContext = require('express-http-context');
const { v4: uuidv4 } = require('uuid');
const errorStatus = require('./helpers/error.status.code');
const {errorHandler} = require('./helpers/error.handler')
const commonRoutes = require('./routes/commonRoutes')
const {logger} = require('./helpers/logger');
// const rTracer = require('cls-rtracer')
function initApp(config, onAfterInit){
    // mongodb.init(config);
    var nonsslPort = normalizePort(process.env.NON_SSL_PORT || config.nonsslPort);
    var app = express();
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(cookieParser());
    //app.use(rTracer.expressMiddleware())
    app.use(httpContext.middleware);
    httpContext.set('CorrelationId', uuidv4());
    // app.use((req,res,next)=>{
    //     if(req.headers.hasOwnProperty('authorization') && req.headers['authorization'])
    //     {
    //        if(req.headers['authorization'].startsWith('Bearer')) {
    //            var decodedVal = jwtDecode(req.headers['authorization']);
    //            const sessionId = decodedVal ? decodedVal.sid : "SESSION_ID_MISSING";
    //            httpContext.set('SessionId', sessionId);
    //            req.headers['x-session-id'] = sessionId;

    //        } 
    //        else {
    //            //Applicable for new login
    //            const sessionId = "NEW_SESSION_ID_GENERATED";
    //            httpContext.set('SessionId', sessionId);
    //            req.headers['x-session-id'] = sessionId;
    //        } 
    //    }
    //    next();
    // })
    app.use(expressWinston.logger({
        winstonInstance: logger,
        meta: true, // optional: control whether you want to log the meta data about the request (default to true)
        requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'], // optional: control which properties of the request are logged
        dynamicMeta: function (req, res) {
            return {
                application: 'BPA',
                user: req.decoded ? req.decoded.nam : 'Unknown',
                protocol: req.protocol,
                clientIP: req.headers['x-forwarded-for'],
            }
        },
        ignoredRoutes: ["/"], // Array of paths to ignore/skip logging. Overrides global ignoredRoutes for this instance
        msg: "HTTP {{req.method}} {{req.url}} ", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
        colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
        ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response

    }));
    // app.use('/', commonRoutes.normalizedAPIs);

    onAfterInit(app)

    app.use(errorHandler());

    app.use(function (req, res, next) {
        var err = new Error('API Not Found');
        err.status = 404;
        next(err);
    });
    app.listen(nonsslPort,()=>{
        logger.info('running on port '+nonsslPort)
    });
}

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

module.exports = {
    "initApp": initApp,
    "logger": logger,
    "errorHandler": errorStatus.errorHandler,
}