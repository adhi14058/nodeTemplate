const mongoose = require("mongoose");
const { logger } = require("./logger")("mongoDB.js");

function initDb(mongo) {
	logger.info("Establishing connection with MongoDB Atlas");
	return mongoose
		.connect(mongo.url, mongo.options)
		.then(() => logger.info("Connected with AppChemist MongoDB Cluster"))
		.catch((err) => logger.error(err));
}

module.exports = { initDb };
