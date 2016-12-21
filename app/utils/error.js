'use strict';

/**
 * Provides a standardized form of a error message to be sent over the REST API.
 * Use this class to assemble error message to be sure that each error message
 * will have:
 * * an error code
 * * an error message
 * * an additional error object, containing additional, arbitrary information
 * @class error
 * @main error
 */

/**
 * Assembl
 * es a standardized error message object.
 * @method
 * @param error {*} can be an object, a number (error code) or a string. If object,
 *   it must consist of:
 *   * errorCode: errorCode
 *   * message (optional) a descriptive message for the user, if omitted,
 *     the default message related to the errorCode is returned instead.
 *     errorObj (optional) further tech/dev info, arbitrary data, e.g. MySql
 *     error information
 *   If numeric, it must represent a valid error code.
 *   If a string, it is treated a error message for a generic error, an errorCode
 *     1000 (generic error) will be used for this.
 *  @return {Object} the standardized error object
 */
var error = function (error) {

    var errorCodes = {
        1000: "Generic error",
        1001: "Wrong credentials",
        1002: "SQL error",
        1003: "Validation error",
        1004: "Connection error",
        1005: "Wrong spatial format",
        1006: "Wrong parameters"
    };

    switch (typeof(error)) {
        case 'object':
            if (!error.errorCode) {
                throw new Error("error() called, but property errorCode is missing");
            }

            if (!errorCodes[error.errorCode]) {
                throw new Error("error() called with an unknown errorCode of [" + error.errorCode + "]");
            }

            return {
                errorCode: error.errorCode,
                errorObj: error.errorObj,
                message: error.message ? error.message : errorCodes[error.errorCode]
            };
            break;

        case 'number':
            if (!errorCodes[error]) {
                throw new Error("error() called with an unknown error code of [" + error + "]");
            }

            return {
                errorCode: error,
                errorObj: null,
                message: errorCodes[error]
            };
            break;

        case 'string':
            var errorCode = 1000; // generic error
            return {
                errorCode: errorCode,
                errorObj: error,
                message: errorCodes[errorCode]
            };
            break;
    }

};

module.exports = error;