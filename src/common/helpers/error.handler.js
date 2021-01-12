const {logger} = require('./logger');
module.exports.errorHandler = ()=>{
    return function (err, req, res, next) {
        if (!err) {
            return next();
        }
        var error = err;
        if (err.hasOwnProperty('err') && err.err) {
            if (typeof err.err == "object") {
                error = err.err;
            } else if (typeof err.err == "string") {
                error = JSON.parse(err.err);
            }
            if (!error) {
                error = err.err;
            }
        } else if (err.hasOwnProperty('error') && err.error) {
            error = err.error;
        } else if (err.hasOwnProperty('name') && err.name == "MongoError") {
            err.name = "DatabaseError";
            err.message = "Database error has occurred.";
            error = err;
        } else {
            error = err;
        }
    
        logger.error("Error while processing API request", err);
    
        if (error.printSimple) {
            delete error.stack;
            delete error.printSimple;
        }
        if (req.app.get('env') !== 'development') {
            delete err.stack;
        }
        res.status(err.statusCode || 500).json({
            error: error
        });
        res.end();
    }
}
