'use strict';
var winston = require('winston');
var mysql = require('mysql');
var config = require('../config/config');

/**
 * set up server globals, e.g. logger, mysql
 *
 * @return {object} logger objects
 */
exports.getLogger = function () {
    var logger;

    // production settings for logging
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: 'verbose',
                handleExceptions: true,
                timestamp: true
            })
        ]
    });
    logger.cli();

    return logger;
};


/**
 * set up DB pool
 *
 * @return {object} DB pool
 */
exports.getDbPool = function () {
    var dbPool;
    var base64Matcher;

    // check if database password is base64 encoded
    base64Matcher = new RegExp('^[A-Za-z0-9+/]+=*$');
    if (!base64Matcher.test(config.db.password)) {
        // It's definitely not base64 encoded.
        console.error('ERROR: config.db.password must be Base64 encoded, but does not seem to be a Base64 string');
    }

    // global MySql connection pool
    dbPool = mysql.createPool({
        host: config.db.host,
        user: config.db.user,
        password: new Buffer(config.db.password, 'base64').toString('ascii'),
        database: config.db.database,
        connectionLimit: 10,
        dateStrings: true // don't convert date fields into Date objects (since
        // it would make the process vulnerable due to implicit, automatic timezone
        // conversions. We do not want that, so let's treat these fields simply as
        // strings.
    });
    return dbPool;
};
