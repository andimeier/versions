'use strict';

/**
 * Utility class.
 * @class utils
 * @type {exports}
 */
var changeCase = require('change-case');

var error = require('./error');


/**
 * Maps "underline case" strings to camel case strings.
 * @method mapToJsonKeys
 * @return {Object} Error object on error
 */
exports.mapToJsonKeys = function (rows, fieldMapping) {

    if (!fieldMapping) {
        return new Error("function [mapToJsonKeys]: Missing parameter fieldMapping");
    }

    var result = [];
    rows.forEach(function (item) {
        var jsonKey;

        // map field names
        for (jsonKey in fieldMapping) {
            if (item[fieldMapping[jsonKey]] !== undefined && fieldMapping[jsonKey] != jsonKey) {
                item[jsonKey] = item[fieldMapping[jsonKey]];
                delete item[fieldMapping[jsonKey]];
            }
        }
        result.push(item);
    });
    return result;
};

/**
 * Changes all keys in the given array of objects to camel case.
 * @method changeKeysToCamelCase
 * @param {Array} rows
 * @returns {Array}
 */
exports.changeKeysToCamelCase = function (rows) {

    var result = [];
    rows.forEach(function (item) {
        var key;

        // map field names
        for (key in item) {
            var newKey = changeCase.camelCase(key);
            if (newKey !== key) {
                item[newKey] = item[key];
                delete item[key];
            }
        }
        result.push(item);
    });
    return result;
};

/**
 * Converts all keys of the passed object into snake_case.
 * @method changeKeysToSnakeCase
 * @param obj {Object/Array} Can be a (single) object or a list of objects.
 * @return {Object/Array} If a single object was passed as a parameter, the modified object will be returned.
 *   If a list of objects was passed as a parameter, then a list of modified objects will be
 *   returned.
 */
exports.changeKeysToSnakeCase = function (obj) {

    var result;
    if (Array.isArray(obj)) {
        // list of objects => call recursively
        result = [];
        obj.forEach(function (o) {
            result.push(changeKeysToSnakeCase(o));
        });
    } else {
        // no array => single object
        for (var key in obj) {
            var newKey = changeCase.snakeCase(key);
            if (newKey !== key) {
                obj[newKey] = obj[key];
                delete obj[key];
            }
        }
        result = obj;
    }
    return result;
};

/**
 * Converts all properties of an object into two lists. One list is the list of database fields,
 * the other list is the list of the corresponding database values. These 2 lists can be used
 * to be inserted into an UPDATE SQL statement.
 * Additionally, the field names (the keys) will be snake_cased. After this, they should correspond
 * to the column names of the underlying database.
 * @method getInsertLists
 * @param obj {Object} a single object representing the data to be written to the database
 * @param escape {Function} (optional) an escaping function for the value. If given, all values (but not the keys)
 *   will be passed through this function via callback.
 *   If not given, the values will not be altered (i.e., not escaped). The escape function
 *   must accept one parameter (for the value to be escaped) and return the escaped value.
 *   A suitable candidate would be e.g. mysql.escape of the node-mysql package.
 * @return {Object} a result object consisting of the two lists 'keys' and 'values'. Example: if the
 * following object will be passed:
 *   obj = {
 *     key1: value1,
 *     key2: value2,
 *     ...
 *   }
 * then the returned object would be:
 *   {
 *     keys: [ key1, key2, ... ],
 *     values: [ value1, value2, ... ],
 *   }
 * @throws Error if the passed object is an array instead of a single object (should never happen)
 */
exports.getInsertLists = function (obj, escape) {
    var keys = [];
    var values = [];
    var key;

    if (Array.isArray(obj)) {
        throw new Error("Function 'getUpdateLists': passed object is not a single object, but an array");
    }

    // if no escaping callback is given, do not transform at all
    escape = escape || function (value) {
            return value;
        };

    // loop through all properties of the given object and build the result lists

    for (key in obj) {
        keys.push(key);
        values.push(escape(obj[key]));
    }

    return {
        keys: keys,
        values: values
    };
};

/**
 * Converts all properties of an object into a column string for an SQL UPDATE statement.
 * This string can be used to insert into a update statement in the place of XXX:
 *   UPDATE table set XXX where ...
 * Additionally, the field names (the keys) will be snake_cased. After this, they should correspond
 * to the column names of the underlying database.
 * @method getUpdateString
 * @param obj {Object} a single object representing the data to be written to the database
 * @param escape {Function} (optional) an escaping function for the value. If given, all values (but not the keys)
 *   will be passed through this function via callback.
 *   If not given, the values will not be altered (i.e., not escaped). The escape function
 *   must accept one parameter (for the value to be escaped) and return the escaped value.
 *   A suitable candidate would be e.g. mysql.escape of the node-mysql package.
 * @return {String} the ready-made string to be inserted into an SQL UPDATE function.
 *
 * Example: if the following object will be passed:
 *   obj = {
 *     key1: value1,
 *     key2: value2,
 *     ...
 *   }
 * then the returned string would be:
 *   "key='value1', key2='value2', ...
 * @throws Error if the passed object is an array instead of a single object (should never happen)
 */
exports.getUpdateString = function (obj, escape) {
    var key;

    if (Array.isArray(obj)) {
        throw new Error("Function 'getUpdateColumnString': passed object is not a single object, but an array");
    }

    // if no escaping callback is given, do not transform at all
    escape = escape || function (value) {
            return value;
        };

    // loop through all properties of the given object and build the result
    var parts = [];
    for (key in obj) {
        parts.push(key + '=' + escape(obj[key]));
    }

    return parts.join(',');
};

/**
 * Filters the list of objects or the single object given so that for each object
 * only the specified attributes are used. All other attributes are discarded. If an unknown
 * field is specified which cannot be found as an object property, it is silently ignored
 * (no error produced).
 *
 * @method filterProperties
 * @param obj {Object|Array} either a single object or a list of objects whose properties will be filtered
 * @param properties {Array} a list of properties, all other properties will be discarded
 * @return {Object} a single obj resp. a list of objects showing only the specified properties.
 *   If obj is a single object, then the filtered single object is returned. If obj is a
 *   list of objects, a list of filtered objects is returned.
 */
exports.filterProperties = function (obj, fields) {

    var filter = function (obj, fd) {
        var filteredObj = {};
        fd.forEach(function (property) {
            if (typeof(obj[property]) != 'undefined') {
                // preserve this field
                filteredObj[property] = obj[property];
            }
        });
        return filteredObj;
    };

    var result;
    if (Array.isArray(obj)) {
        // list of objects => filter each entry separately
        result = [];
        obj.forEach(function (item) {
            // result.push(changeKeysToSnakeCase(o));
            // result.push(filterProperties(o, fields));
            result.push(filter(item, fields));
        });
    } else {
        // a single object => filter it
        result = filter(obj, fields);
    }
    return result;
};

/**
 * Sends the result of the operation back to the client. The response body will contain a JSON
 * object containing the information. In error case, the response will consist of a JSON object
 * with the only key 'error', which contains further attributes describing the error.
 * In success case, the response will consist of a maximum of 2 keys:
 * * data ... contains the requested data (rows)
 * * info ... contains additional info (metainformation) about the query, such as
 * number of affected rows
 * @method sendResult
 * @param res {Object} the response object which will be used for the response
 * @param data {Object} the retrieved data. This will be sent under the key 'data' in the
 *   response body
 * @param info {Object} metadata about the query. This may contain information like numbers of
 *   affected rows, numbers of rows retrieved, indication if there are further 'pages' to be
 *   retrieved etc. This will be sent under the key 'info' in the response body
 * @param err {Object} the error, if any. If there, the error object will be sent back in the
 *   response body as JSON object with a HTTP error status code. If the error object is a
 *   standard error object (errorCode/errorObj/message), it will be propagated "as is". If the
 *   error object is something else, a standard error object will be created, including the
 *   error object in the property 'errorObj'.
 */
exports.sendResult = function (res, data, info, err) {
    if (err != null) {

        var e;
//	  console.log('passed err object: ' + JSON.stringify(err));
        if (typeof(err) === 'object' && err.errorCode) {
//		  console.log('already an error object prepared => propagate it');
            // already an error object prepared => propagate it:
            e = error({
                errorCode: err.errorCode,
                errorObj: err.errorObj,
                message: err.message || 'Query error'
            });
        } else {
//		  console.log('error is not an object or no object looking like "our" error object');
//		  console.log('typepf = [%s], err.errorCode=[%s]', typeof(err), err.errorCode || 'NULL');
            // error is not an object or no object looking like "our"
            // error object => wrap it into "our" error object
            e = error({
                errorCode: 1002,
                errorObj: err,
                message: 'Query error'
            });
        }

        res.send(400, {
            error: e
        });
    } else {

        res.send(200, {
            data: data,
            info: info
        });
    }
};