'use strict';

/**
 * data set utility class.
 * @class sql
 * @type {exports}
 */
var q = require('q');
var _ = require('lodash');

var error = require('./error');
var sql = require('./sql');

/**
 * creates a new data set and returns the data set ID in a callback function
 * @param {string} dataSetType type of data set to be created, e.g. 'version/projektcockpit'
 * @param {array} dataSetTables list of table names which should be combined into a data set
 * @return {promise} promise resolving into dataSetId {integer}
 */
exports.createDataSet = function (dataSetType, dataSetTables) {
    var dataSetId;

    // create new data set
    return sql.execute('insert into _data_sets (type, cdate) values (' + escape(dataSetType) + ', now())')
        .then(function (result) {

            dataSetId = result.insertId;
            logger.verbose('[xgfggg] set dataSetId to ' + dataSetId);

            // tag input data as being related to this data set
            return linkSetData(dataSetId, dataSetTables);
        })
        .then(function () {
            return q.when(dataSetId);
        })
        .fail(function (error) {
            error(error);
        });
};


/**
 * link the specified tables to a data set
 * @param {number} dataSetId data set ID of the data set to be modified
 * @param {array} dataSetTables list of table names which should be combined into a data set
 * @returns {promise} promise resolving when all tables have been linked to the data set
 */
function linkSetData(dataSetId, dataSetTables) {
    var tableNames;
    var qStatements;

    if (!_.isArray(dataSetTables)) {
        // ooh, this is a little harsh, isn't it? Try to come up with some decent error handling instead ...
        throw new Error('dataSetTables must be an array, but is: ' + dataSetTables);
    }

    qStatements = [];
    dataSetTables.forEach(function (tableName) {
        logger.verbose('ADDING next insert promise for table ' + tableName);
        logger.verbose('adding table to data set [' + dataSetId + ']: ' + tableName);
        qStatements.push(sql.execute("insert into _data_set_data (data_set_id, table_name, table_import_key) select " + dataSetId + ", '" + tableName + "', import_date from " + tableName + " order by import_date desc limit 1"));
    });
    logger.verbose('finished linking tables to data set');

    return q.all(qStatements);
}


/**
 * sets the release flag on a data set
 * @param {number} dataSetId
 * @param {string} comment release comment (free text)
 * @return {promise}
 */
exports.releaseDataSet = function (dataSetId, comment) {
    var defer;

    defer = q.defer();

    sql.execute('select released from _data_sets where data_set_id=' + dataSetId)
        .then(function (result) {
            if (result[0].released) {
                defer.resolve(q.when('data set ' + dataSetId + ' has already been released. No change.'));
                return;
            }

            return sql.execute("update _data_sets set released=1, release_date=NOW(), release_comment=" + escape(comment) + " where data_set_id=" + dataSetId);
        })
        .then(function () {
            defer.resolve('data set ' + dataSetId + ' has been released successfully');

        })
        .fail(function (err) {
            defer.reject(err);
        });

    return defer.promise;
};
