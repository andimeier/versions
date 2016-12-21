/**
 * allow CORS from the configured source
 *
 * options:
 * * allowOrigin: the allowed CORS URL. If not set, no CORS headers will be written
 * * logger: a logger instance. If not there, CORS headers will not show up in the log
 */
function allowCrossDomain(options) {

    if (!options.allowOrigin) {
        // do not write CORS headers, if CORS is not configured
        if (options.logger) {
            options.logger.info('No CORS configured.');
        }

        return function (req, res, next) {
            next();
        };
    }

    if (options.logger) {
        options.logger.info('Allowing CORS access to [' + options.allowOrigin + ']');
    }

    return function (req, res, next) {
        res.header('Access-Control-Allow-Origin', options.allowOrigin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');

        // intercept OPTIONS method
        if ('OPTIONS' === req.method) {
            res.send(200);
        }
        else {
            next();
        }
    }

}

exports = module.exports = allowCrossDomain;