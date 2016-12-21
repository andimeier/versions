'use strict';

/**
 * A class for a generic reporter, for retrieving statistical queries against the database.
 *
 * @class genericReport
 */
var _ = require('lodash');

var utils = require('./utils');
var error = require('./error');
var xml = require('./xml');

/**
 * Performs a database query, using the given SQL string as input, and returns
 * the retrieved rows.
 *
 * This provides a generic utility for "rapid report development". You don't have to
 * implement a separate module/function for every new report, but can simply
 * create the SQL statement and then use this "generic report" facility.
 *
 * The function executes the report, translates all database columns to the respective
 * JSON counterparts (changing case from snake case to camel case) and returns the
 * JSON result in the HTTP response object. Nothing else to do.
 *
 * Since this is a very simple class, parameter parsing and processing must be done
 * before (possibly changing the SQL statement).
 *
 * @method genericReport
 * @param req {Object} express request object
 * @param res {Object} express response object
 * @param sql {String} the SQL statement to be executed which generates the data for the report
 * @param callback {Function} callback function. If defined, will be called for each row before sending the result to
 *   the client.
 * @param responseFormat {string} reponse format, can be 'xml' or 'json'
 * @param singleRow {boolean} if true, the select must yield a single row. The result will not be wrapped into an
 *   array, but delivered as a single JSON object. Results in an error if more than 1 row is selected.
 * @param noWrap {boolean} if true, the result of the select will not be wrapped into a "data" element but instead
 *   build directly the output. Explanation: normally, the SQL output will be "wrapped" into an object consisting of
 *   the properties "data" (containing the SQL result) and "total" (containing the number of data elements in "data").
 *   For queries which only request the number of records which WOULD be selected (select count(*) as total from XXX
 *   where ...), this would result in a result object like this: { data: { total: 228 }, total: 1 }.
 *   But what you would really see is: { data: null, total: 228 }. You can enforce this behaviour by passing
 *   noWrap = true
 */
exports.genericReport = function (req, res, sql, callback, responseFormat, singleRow, noWrap) {
  logger.verbose('---------------------------------');
  logger.verbose('[' + (new Date()).toLocaleTimeString() + '] GET Request: ' + req);

  logger.info('requested format: [' + responseFormat + ']');

  if (responseFormat) {
    if (['xml', 'json'].indexOf(responseFormat) === -1) {
      logger.error('unknown response format requested: [' + responseFormat + ']. Resorting to json.');
      responseFormat = 'json';
    }

  } else if (settings.defaultResponseFormat) {
    responseFormat = settings.defaultResponseFormat;
    logger.info('no format requested, using global default setting : [' + responseFormat + ']');

  } else {
    // default: json
    responseFormat = 'json';
    logger.info('no format requested, use hardcoded default: [' + responseFormat + ']');
  }

  dbPool.getConnection(function (err, connection) {

    if (err) {
      // an error has occurred during connection

      /* send error message back to client (in minimized form because
       the error details on failing to establish a connection is not
       intended to be delivered to the client
       */
      res.send(400, error({
        errorCode: 1004,
        message: 'Error trying to connect to database. See the server\'s logfile for details.'
      }));

      return;
    }

    // connection established
    // query the database for some data
    logger.verbose('Excuting SQL for req [' + req.url + ']: ' + sql);

    connection.query(sql, function (err, rows) {
      var data; // the data delivered to the requesting client

      logger.verbose('got data from DB server for req [' + req.url + ']');

      if (err != null) {
        err.sql = sql; // add SQL to error object
        //logger.verbose('ERROR: ' + JSON.stringify(err, null, 2));
        res.send(400, error({
          errorCode: 1002,
          errorObj: err,
          message: 'Query error'
        }));
        return;
      }

      logger.verbose('got data from DB server, number of rows: ' + rows.length);
      var result = utils.changeKeysToCamelCase(rows);
      if (result instanceof Error) {
        logger.error('Error at mapping keys to JSON keys: ' + result);
      }

      // transformation?
      if (callback && typeof(callback) === 'function') {
        rows.forEach(function (o) {
          callback(o)
        });
        logger.verbose('done with transforming rows via the callback function');
      } else {
        logger.verbose('no callback function provided for transforming rows => skipping this step');
      }


      if (singleRow) {
        logger.verbose('well, well, a single row should be returned');
        // check if only one row
        if (result.length > 1) {
          logger.verbose('sending response to client ...');
          res.send(400, error({
            errorCode: 1002,
            errorObj: err,
            message: 'Too many rows selected while "singleRow" specified'
          }));
        }

        // success: send row back (without being wrapped into array)
        data = result[0];

      } else {
        // no singleRow specified: send array of rows
        data = result;
      }

      logger.verbose('number of data items (for request [' + req.url + ']): [' + data.length + ']');

      switch (responseFormat) {
        case 'xml':
          res.setHeader('content-type', 'text/xml');
          res.status(200).send(xml.convert2xml(data));
          break;

        case 'json':
          res.setHeader('content-type', 'application/json');
          res.status(200).send(JSON.stringify(data));
          break;
      }
    });


    // close connection
    connection.release();
  });
};


/**
 * This provides a generic utility for "rapid report development". You don't have to
 * implement a separate module/function for every new report, but can simply
 * assemble your object and then use this "generic report" facility to send it.
 *
 * @method genericReportNoSql
 * @param req {Object} express request object
 * @param res {Object} express response object
 * @param data {Array|Object} the data to be sent, will be serialized to JSON
 */
exports.genericReportNoSql = function (req, res, data) {
  var singleRow;

  singleRow = (!Array.isArray(data));

  if (!Array.isArray(data)) {
    data = [data]; // wrap it
  }
  logger.verbose('Typeof data = ' + typeof data);

  if (data instanceof Error) {
    logger.error('Error at mapping keys to JSON keys: ' + data);
  }

  if (singleRow) {
    logger.verbose('singleRow!!!!!!!!!!!!!!');
    // check if only one row
    if (data.length > 1) {
      res.send(400, error({
        errorCode: 1002,
        errorObj: err,
        message: 'Too many rows selected while "singleRow" specified'
      }));
    }

    // success: send row back (without being wrapped into array)
    res.setHeader('content-type', 'text/xml');
    res.send(200, xml.convert2xml(data));
  } else {
    logger.verbose('no singleRow, sending array of rows ...');
    // no singleRow specified: send array of rows
    res.setHeader('content-type', 'text/xml');
    res.send(200, xml.convert2xml([data]));
  }
};


/**
 * Execute an SQL statement and call callback with the data.
 * The field names will be converted from snake_case to camelCase.
 *
 * @method retrieve
 * @param sql {string} the statement to be executed
 * @param success {function} callback function on success, the data will be passed (always as array, even if it is
 *   only 1 row)
 * @param error {function} callback function on error, the error object will be passed
 */
exports.retrieve = function (sql, success, error) {

  dbPool.getConnection(function (err, connection) {
    if (err) {
      // an error has occurred during connection

      //logger.error('DB connection error: ' + JSON.stringify(err, null, 2));
      logger.error('DB connection error!');
      //error('DB connection error: ' + JSON.stringify(err, null, 2));
    }

    // connection established
    // query the database for some data
    logger.verbose('Excuting SQL: ' + sql);

    connection.query(sql, function (err, rows) {
      if (err != null) {
        error(err);
        return;
      }

      var result = utils.changeKeysToCamelCase(rows);
      if (result instanceof Error) {
        logger.error('Error at mapping keys to JSON keys: ' + result);
        error('Error at mapping keys to JSON keys');
      }

      success(result);
    });


    // close connection
    connection.release();

  });
};


exports.performQuery = function (req, res, sqlTemplate, selectColumns, queryParams, additionalConstraints, orderClause, limit) {
  var whereConstraints;
  var sql;

  try {
    if(queryParams){
      whereConstraints = parseParameters(_.merge(req.query, req.params), queryParams);
    }

  } catch (e) {
    if (e.name === 'ParameterError') {
      res.send(404, error(e.message));
      return;
    }

    throw e;
  }

  if (additionalConstraints) {
    whereConstraints.push.apply(whereConstraints, additionalConstraints);
  }

  sql = getSql(sqlTemplate, selectColumns, whereConstraints, orderClause, limit);
  console.log(sql);
  exports.genericReport(req, res, sql, null, res.locals.format);
};


/**
 * Parses the given parameters and uses them to generate SQL constraints for
 * retrieving the data. The SQL constraints reflect the parsed parameters - you
 * might have guessed this ;)
 *
 * @param params {object} the query parameters given to the route
 * @param paramDefinitions {object} the params definition object
 * @returns {array} a list of WHERE constraints (strings) or an empty array if no constraints could be determined.
 *   This would be the case if no constraining query parameters could be recognized.
 * @throws ParameterError on parsing errors
 */
function parseParameters(params, paramDefinitions) {
  var constraints = []; // the collected constraints - these will form
  // the WHERE portion of the data query
  var errorMessages = [];

  logger.verbose('params: ' + JSON.stringify(params, null, 2));
  logger.verbose('paramDefinitions: ' + JSON.stringify(paramDefinitions, null, 2));

  _.forEach(paramDefinitions, function (counterpart, paramName) {
    var newValue;

    if (_.isUndefined(params[paramName]) || params[paramName] === '') {
      return;
    }

    // map parameter definition to standard format (object notation)
    if (typeof counterpart === 'string') {
      counterpart = {
        type: 'string',
        column: counterpart
      };
    }

    if (counterpart.mandatory && _.isUndefined(params[paramName])) {
      errorMessages.push('missing mandatory parameter ' + paramName);
    }

    if (!counterpart.type) {
      throw new Error('parameter type is mandatory when using parameter definition object, but type is not set');
    }

    switch (counterpart.type) {
      case 'boolean':
        // boolean values will be mapped to 0/1 values
        constraints.push(counterpart.column + "=" + (Number(params[paramName]) ? 1 : 0));
        break;

      case 'string':
        constraints.push(counterpart.column + "='" + params[paramName] + "'");
        break;

      case 'numeric':
        newValue = Number(params[paramName]);

        if (!_.isNaN(newValue)) {
          constraints.push(counterpart.column + "=" + newValue);

        } else {
          errorMessages.push('parameter [' + paramName + '] should be numeric but is [' + params[paramName] + ']');
        }
        break;
    }
  });

  if (errorMessages.length) {
    throw {
      name: 'ParameterError',
      message: errorMessages.join("\n")
    };
  }

  return constraints;
}


/**
 *
 * @param {string} sqlTemplate SQL template string, possibly containing some or all of the placeholders ${COLUMNS} and
 *   ${WHERE}
 * @param {array} columns
 * @param {array} whereConstraints
 * @param {string} orderClause
 * @param {number} limit maximum number of records to be fetched
 * @returns {string} the assembled SQL statement
 */
function getSql(sqlTemplate, columns, whereConstraints, orderClause, limit) {

  if (sqlTemplate.indexOf('${COLUMNS}') === -1 && columns) {
    throw new Error('SQL template has no placeholder COLUMNS but there are column definitions');
  } else if (sqlTemplate.indexOf('${COLUMNS}') !== -1 && (!columns || !_.isArray(columns) || !columns.length)) {
    throw new Error('SQL template has placeholder COLUMNS but there are no columns provided');
  }

  if (sqlTemplate.indexOf('${WHERE}') === -1 && whereConstraints) {
    throw new Error('SQL template has no placeholder WHERE but there are constraint definitions');
  }

  if (sqlTemplate.indexOf('${WHERE}' !== -1)) {
    var where;

    logger.info('where Found');

    if (whereConstraints && _.isArray(whereConstraints) && whereConstraints.length) {
      logger.verbose('whereConstraints given: length = ' + whereConstraints.length);
      logger.verbose('whereConstraints given: ' + whereConstraints.join('@@'));
      where = 'WHERE ' + whereConstraints.join(' AND ');
    } else {
      where = '';
    }

    sqlTemplate = sqlTemplate.replace(/\$\{WHERE}/g, where);
  }

  if (sqlTemplate.indexOf('${COLUMNS}') !== -1) {
    if (!_.isArray(columns) || !columns.length) {
      throw new Error('placeholder ${COLUMNS} found in template [' + sqlTemplate + '], but no columns have been specified');
    }

    sqlTemplate = sqlTemplate.replace('${COLUMNS}', columns.join(', '));
  }

  if (orderClause) {
    sqlTemplate = sqlTemplate + ' ORDER BY ' + orderClause;
  }

  if (limit) {
    if (String(Number(limit)) !== limit) {
      throw new Error('limit value must be an integer, but is [' + limit + ']');
    }

    sqlTemplate = sqlTemplate + ' LIMIT ' + limit;
  }

  return sqlTemplate;
}


