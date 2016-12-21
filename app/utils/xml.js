'use strict';

/**
 * Utility class.
 * @class xml
 * @type {exports}
 */
var xmlbuilder = require('xmlbuilder');
var _ = require('lodash');


/**
 * convert JSON data set to a XML data set suitable for Excel data source
 * @param {array} data array of data objects
 * @return {Object} Error object on error
 */
exports.convert2xml = function (data) {
    var xml;

    xml = xmlbuilder.create('report');

    data.forEach(function (dataRow) {
        var row = xml.ele('row');

        _.forEach(dataRow, function (value, key) {
            if (typeof value !== 'function') {
                row.ele(key, value);
            }
        });
    });

    // for Excel, add one empty data element to work around the following effect:
    // If the XML source contains only a single element (only one <row>), the Excel would not import the XML data
    // as a table, so it does not render a header line. To force Excel to interpret the data as table, even if there
    // is only one row, we have to provide the row a second time. Thus, Excel recognizes repeating elements and render
    // a table. In this case, a one-line table, correctly.
    //
    // Example:
    //   not imported as table: <data> <row><item>Alex</item></row> </data>
    //   imported as table: <data> <row><item>Alex</item></row> <row></row> </data>
    // See http://www.excelforum.com/excel-programming-vba-macros/724793-xml-import-does-not-always-show-headers.html
    //
    // we can remove this workaround if a "real" frontend is consuming the data
    xml.ele('row'); // workaround

    xml.end({pretty: true});

    return '<?xml version="1.0"?>' + xml; // FIXME why do I have to add the XML header manually?
};
