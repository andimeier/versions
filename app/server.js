'use strict';

var express = require('express');
var bodyParser = require('body-parser');

// configs
var setup = require('./utils/setup');
var outputFormat = require('./utils/outputFormat');
var cors = require('./utils/cors');
var session = require('./utils/session');
var config = require('./config/config');
var settings = require('./config/settings');
var cas = require('./utils/authentication');

// child routers
var versionRouter = require('./routes/versionRouter');

//TODO CONFIG??
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

global.escape = require('mysql').escape; // make mysql.escape() globally available
global.dbPool = setup.getDbPool();
global.logger = setup.getLogger();
global.settings = settings;


var app = express();

// ------ additional middleware ------

app.use(cors({
    allowOrigin: config.accessControlAllowOrigin,
    logger: logger
}));

app.use(bodyParser());
app.use(session);
app.use(outputFormat.extractFormatFromAcceptHeader);


// ------ routes ------

// ASV module
//app.use(cas.bounce);
app.use('/version', versionRouter);
app.get('/isLoggedIn',cas.isLoggedIn);
app.get('/login', cas.bounce_redirect);
app.get('/logout', cas.logout);


app.use(function (req, res) {
    logger.verbose('Unrecognized route: ', {url: req.originalUrl});
    res.send(404);
});


// ------ start the server ------

app.listen(config.port, config.listenOn);

logger.verbose('Listening on port ' + config.port + (config.listenOn ? ' on ' + config.listenOn : '') + ' ...');
logger.verbose('Set DB connection to host ' + config.db.host);

exports.app = app;
