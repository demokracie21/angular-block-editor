gulp = require 'gulp'
karma = require('karma').server
notifier = require 'node-notifier'
path = require 'path'

autoprefixer = require 'gulp-autoprefixer'
cache = require 'gulp-cached'
coffee = require 'gulp-coffee'
connect = require 'gulp-connect'
concat = require 'gulp-concat'
html2js = require 'gulp-ng-html2js'
htmlmin = require 'gulp-htmlmin'
less = require 'gulp-less'
minifyCSS = require 'gulp-minify-css'
ngAnnotate = require 'gulp-ng-annotate'
plumber = require 'gulp-plumber'
remember = require 'gulp-remember'
sourcemaps = require 'gulp-sourcemaps'
uglify = require 'gulp-uglify'
utils = require 'gulp-util'

coffeeGlob = ['src/**/*.coffee', "!src/**/*.spec.coffee"]
compileGlob = ['dist/**/*.js', '!dist/angular-block-editor.min.js']
karmaGlob = 'src/**/*.coffee'
lessGlob = ["src/**/*.less"]
partialsGlob = ["src/**/*.html"]

config = process.env


onError = (err) ->
    utils.beep()
    utils.log utils.colors.red(err)

    errType = err.type or err.name or 'Unknown'
    errLine = err.line or err.location?.first_line or '?'

    notifier.notify(
        title: "Error in #{err.plugin}"
        message: "#{errType} error in #{path.relative process.cwd(), err.filename} on line #{errLine}"
    )
    this.emit 'end'

handleErrors = ->
    plumber(errorHandler: onError)


gulp.task 'karma', ->
    karma.start
        configFile: path.join(__dirname, 'karma.conf.js')
        singleRun: yes

gulp.task 'coffee', ->
    return gulp.src(coffeeGlob)
        .pipe(handleErrors())
        .pipe(cache('coffee')) # only pass through changed files
        # .pipe(if config.NODE_ENV != 'production' then sourcemaps.init() else utils.noop())
        .pipe(coffee())
        .pipe(if config.NODE_ENV == 'production' then ngAnnotate() else utils.noop())
        .pipe(if config.NODE_ENV == 'production' then uglify() else utils.noop())
        .pipe(remember('coffee')) # add back all files to the stream
        # .pipe(if config.NODE_ENV != 'production' then sourcemaps.write() else utils.noop())
        .pipe(concat('angular-block-editor.js'))
        .pipe(gulp.dest("dist"))


gulp.task 'coffee-watch', ['coffee'], ->
    gulp.watch coffeeGlob, (event) ->  # watch the same files in our scripts task
        if event.type == 'deleted'  # if a file is deleted, forget about it
            delete cache.caches['coffee'][event.path]
            remember.forget('coffee', event.path)
        gulp.start('coffee')


gulp.task 'partials', ->
    gulp.src(partialsGlob)
        .pipe(handleErrors())
        .pipe(cache('partials')) # only pass through changed files
        .pipe htmlmin(collapseWhitespace: true)
        .pipe(html2js(
            moduleName: 'ngBlockEditor'
            prefix: 'ng-block-editor/'
            declareModule: no
        ))
        .pipe(remember('partials')) # add back all files to the stream
        .pipe(concat('angular-block-editor.tmpls.js')) # do things that require all files
        .pipe(gulp.dest("dist"))


gulp.task 'partials-watch', ['partials'], ->
    gulp.watch partialsGlob, (event) ->  # watch the same files in our scripts task
        if event.type == 'deleted'  # if a file is deleted, forget about it
            delete cache.caches['partials'][event.path]
            remember.forget('partials', event.path)
        gulp.start('partials')


gulp.task 'compile', ->
    return gulp.src(compileGlob)
        .pipe(handleErrors())
        .pipe ngAnnotate()
        .pipe uglify()
        .pipe(concat('angular-block-editor.min.js'))
        .pipe(gulp.dest("dist"))

gulp.task 'compile-watch', ['compile'], ->
    gulp.watch compileGlob, (event) ->
        gulp.start 'compile'

gulp.task 'less', ->
    gulp.src(lessGlob)
        .pipe(handleErrors())
        # .pipe(sourcemaps.init())
        .pipe(less())
        .pipe autoprefixer(browsers: 'last 2 versions', cascade: true, remove: true)
        .pipe(if config.NODE_ENV == 'production' then minifyCSS() else utils.noop())
        # .pipe(sourcemaps.write())
        .pipe(concat 'angular-block-editor.css')
        .pipe(gulp.dest("dist"))


gulp.task 'less-watch', ['less'], ->
    gulp.watch lessGlob, (event) ->  # watch the same files in our scripts task
        gulp.start('less')


gulp.task 'build-js', ['coffee', 'partials'], ->
    gulp.start 'compile'


gulp.task 'connect', ->
    connect.server
        root: ['examples', 'bower_components', 'dist']


gulp.task 'build', ['build-js', 'less']
gulp.task 'watch', ['coffee-watch', 'partials-watch', 'compile-watch', 'less-watch']
gulp.task 'dev', ['watch', 'connect']
gulp.task 'test', ['karma']

gulp.task 'default', ['build']
