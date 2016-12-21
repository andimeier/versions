/**
 * Created by z003fzxr on 08.02.2016.
 */
var session = require('express-session');
var config = require('./../config/config');
var sessionConfig = session(config.sessionConf);

exports = module.exports = sessionConfig;