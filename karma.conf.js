// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: 'dist',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha', 'chai', 'chai-shallow-deep-equal'],

        // list of files / patterns to load in the browser
        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-resource/angular-resource.js',
            'app/bower_components/angular-cookies/angular-cookies.min.js',
            'app/bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.min.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.min.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'app/bower_components/checklist-model/checklist-model.js',
            'app/bower_components/jquery/dist/jquery.min.js',
            'app/bower_components/lodash/lodash.min.js',
            'app/bower_components/ngstorage/ngStorage.min.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'app/bower_components/raphael/raphael-min.js',
            'app/bower_components/moment/min/moment.min.js',
            'app/bower_components/angular-animate/angular-animate.min.js',
            'app/bower_components/sprintf/dist/sprintf.min.js',

            // load module definition files first
            'app/components/**/*.module.js',

            'app/scripts/*.js',
            'app/scripts/**/*.js',
            'app/components/**/*.js',
            'app/routes/**/*.js',
            'app/config/config.js',
            '../test/spec/**/*.spec.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 9876,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
