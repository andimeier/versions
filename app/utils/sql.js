/**
 * SQL utility class.
 * @class sql
 * @type {exports}
 */
var q = require('q');

var error = require('./error');

/**
 * executes a query and returns the result in a callback function
 * @param sql
 * @param success
 * @return {promise} promise resolving into the SQL result or - in case of an error -
 *   rejecting into the error response
 */
exports.execute = function (sql, success, error) {
    var qResult;
    var qConnection;
    var qStatement;

    qResult = q.defer();

    qConnection = q.nbind(dbPool.getConnection, dbPool)();

    qConnection.catch(function (err) {
        qResult.reject(err);
    });

    qConnection.done(function (connection) {
        // connection established

        // query the database for some data
        logger.verbose('Excuting SQL [' + sql + ']');

        qStatement = q.nbind(connection.query, connection)(sql);

        // close connection
        qStatement.finally(function () {
            logger.verbose('FINALLY: releasing connection');
            connection.release();
        });

        qStatement.done(function (result) {
            logger.verbose('[76676] result (sql=' + sql + ') is ' + JSON.stringify(result, null, 2));

            logger.verbose('[3454] calling success with result ...');
            qResult.resolve(result[0]);
        });

    });

    return qResult.promise;
};


/**
 * executes a query and returns the result in a callback function
 * @param sql
 * @param success
 * @return {promise} promise resolving into the SQL result or - in case of an error -
 *   rejecting into the error response
 */
exports.select = function (sql, success, error) {
    var qResult;
    var qConnection;
    var qStatement;

    qResult = q.defer();

    qConnection = q.nbind(dbPool.getConnection, dbPool)();

    qConnection.catch(function (err) {
        qResult.reject(err);
    });

    qConnection.done(function (connection) {
        // connection established

        // query the database for some data
        logger.verbose('Excuting SQL [' + sql + ']');

        qStatement = q.nbind(connection.query, connection)(sql);

        // close connection
        qStatement.finally(function () {
            logger.verbose('FINALLY: releasing connection');
            connection.release();
        });

        qStatement.done(function (result) {
            logger.verbose('[76676] result (sql=' + sql + ') is ' + JSON.stringify(result[0]));

            logger.verbose('[3454] calling success with result ...');
            qResult.resolve(result);
        });

    });

    return qResult.promise;
};
