/**
 * Created by z003fzxr on 08.02.2016.
 */
var CASAuthentication = require('cas-authentication');
var config = require('./../config/config');

var casConfig = config.casConf;
var cas = new CASAuthentication(casConfig);

function bounce(req, res, next) {
    req.url = req.originalUrl; //because of capsulated router configuration
    cas.bounce(req, res, next);
}

function bounce_redirect(req, res, next) {
    cas.bounce_redirect(req, res, next);
}

function logout(req, res, next) {
    cas.logout(req, res, next);
}

function isLoggedIn(req, res, next) {
    if (req.session.id) {
        res.send(200, "Session is valid");
    } else {
        res.send(401, "No Session detected");
    }
}

module.exports = {
    bounce: bounce,
    logout: logout,
    bounce_redirect: bounce_redirect,
    isLoggedIn: isLoggedIn
};