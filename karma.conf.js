// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: __dirname,

        files: [
            'bower_components/angular/angular.js',
            'bower_components/lodash/lodash.js',
            'src/**/!(*.spec).coffee',
            'src/**/*.spec.coffee'
        ],

        preprocessors: {
            'src/**/!(*.spec).coffee': ['coverage'],  // coverage converts coffee scripts itself
            'src/**/*.spec.coffee': ['coffee'],  // coverage converts coffee scripts itself
        },
        coverageReporter: {
            type : 'html',
            dir : 'coverage/',
        },

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha', 'chai'],

        // test results reporter to use // possible values: 'dots', 'progress' // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 11876,

        colors: true,

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
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
