'use strict';


/**
 * parses the Accept header and sets the desired output format accordingly. The resulting format is made available to
 * subsequent middleware in res.locals.format.
 * Recognized output formats are:
 * * application/xml -> res.locals.format = 'xml'
 * * application/json -> res.locals.format = 'json'
 *
 * If an unknown MIME type is requested, a 406 response is sent.
 *
 * Note that that (child) routers have to handle the case when no Accept header was present - in this case, the local
 * variable res.locals.format would be undefined
 */
exports.extractFormatFromAcceptHeader = function (req, res, next) {
    res.format({
        'application/xml': function () {
            req.params.format = 'xml';
            res.locals.format = 'xml';
            next();
        },

        'application/json': function () {
            req.params.format = 'json';
            res.locals.format = 'json';
            next();
        },

        'default': function () {
            // log the request and respond with 406
            res.status(406).send('Not Acceptable');
        }
    });
};


/**
 * retrieves the desired response format, either by mirroring an already existing format back or - if none is given -
 * by using defaults from the config
 *
 * @param {string} responseFormat the desired response format. Can be 'json' or 'xml'. If null, the default format from the
 *   config is used. If none is configured, default response format is 'json'
 * @return {string} the response format to be used
 */
exports.getFormat = function (responseFormat) {
    var allowedFormats;

    allowedFormats = ['xml', 'json'];
    logger.info('checking responseformat: ' + responseFormat);

    if (responseFormat) {
        if (allowedFormats.indexOf(responseFormat) !== -1) {
            logger.info('valid reponseformat: ' + responseFormat);
            return responseFormat;
        } else {
            logger.error('invalid reponse format requested: [' + responseFormat + ']');
        }
    }

    // no valid reponseFormat given => resort to defaults

    if (global.settings.defaultResponseFormat) {
        responseFormat = global.settings.defaultResponseFormat;
        logger.info('using global default setting for response format: [' + responseFormat + ']');
        return responseFormat;

    }

    // default: json
    responseFormat = 'json';
    logger.info('using hardcoded default response format: [' + responseFormat + ']');
    return responseFormat;
};
