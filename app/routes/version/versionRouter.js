'use strict';
var router = require('express').Router({ mergeParams: true });


// --- routes ---

router.get('/current', version.getCurrentVersion);

module.exports = router;
