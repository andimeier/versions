'use strict';
var path = require('path');
var _ = require('lodash');

var appRoot = path.dirname(require.main.filename);
var report = require(appRoot + '/utils/report');

/**
 * returns the current version of the given item
 */
exports.getCurrentVersion = function (req, res) {
    var selectColumns;
    var queryParams;
    var sqlTemplate;
    var additionalConstraints;
    var orderBy;
    var itemCode;

    orderBy = 'import_date';
    if (req.query.item) {
        itemCode = req.query.item;
    } else {
        res.send(404, error("No item selected!"));
    }

    //sqlTemplate = "select ${COLUMNS} from ia_primavera_aufwand ${WHERE}";
    sqlTemplate = "SELECT \
        import_date,\
        SUM(task_budgeted_hours) as task_budgeted_hours,\
        SUM(task_actual_hours) as task_actual_hours,\
        SUM(task_ts_actual_hours) as task_ts_actual_hours\
    FROM \
    ia_primavera_aufwand \
    WHERE\
    project_number IN ({$PROJECTNUMBER})\
    GROUP BY import_date";
    sqlTemplate = sqlTemplate.replace("{$PROJECTNUMBER}", projectNumber);


    report.performQuery(req, res, sqlTemplate, selectColumns, queryParams, additionalConstraints, orderBy);
};
