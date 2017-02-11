var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
const mocha = require('gulp-mocha');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var prefix = require('gulp-autoprefixer');
var gutil = require('gulp-util');
var del = require('del');
var browserSync = require('browser-sync').create();
var wiredep = require('wiredep').stream;
var nodemon = require('gulp-nodemon');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var sourcemaps = require('gulp-sourcemaps');
var through = require('through2');
var eslint = require('gulp-eslint');
var rev = require('gulp-rev');
var yargsArg = require('yargs').argv;

var isprod = (yargsArg.env === 'prod');

var noop = function () {
  return through.obj();
};

var dev = function (task) {
  return isprod ? noop() : task;
};

var prod = function (task) {
  return isprod ? task : noop();
};

var test = ['unit-test-server/**/*.js'];

var testHintJs = [
  'app_server/**/*.js',
   'app.js',
  '../client/public/javascripts/*.js',
  '!../client/public/myApp/*.js'
];


var app_clientJs = ['../client/app_client/**/*.js'];

gulp.task('hint', function () {
  return gulp.src(testHintJs /*, {since: gulp.lastRun('hint')}*/)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', function () {
  return gulp.src(test, {read: false})
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('error', gutil.log);
});

gulp.task('scripts',
  gulp.series('hint', function scriptsInternal() {
    return gulp.src(/*glob*/
      //only app_client files, because the generated file will be imported into app_client/index.html
      app_clientJs, {
        sourcemaps: true
      })
      .pipe(sourcemaps.init())
      .pipe(dev(sourcemaps.init()))
      .pipe(cached('ugly'))
      .pipe(uglify().on('error', gutil.log))
      .pipe(remember('ugly'))
      .pipe(concat('mysite.min.js'))
      .pipe(gulp.dest('../client/public/myApp')); //write mysite.min.js to build dir
  })
);

gulp.task('styles', function () {
  return gulp.src('../client/app_client/style.css', {since: gulp.lastRun('styles')})
    .pipe(minifyCSS())
    .pipe(prefix())
    .pipe(gulp.dest('../client/public/css'));
});

gulp.task('nodemon', function () {
  return nodemon({
    script: 'bin/www',
    env: {'NODE_ENV': 'development'}
  });
});

gulp.task('default',
  gulp.series(
    gulp.parallel('styles', 'scripts'),
    'nodemon',

    function watcher(done) {
      gulp.watch(['app_server/**/*.js', '../client/app_client/**/*.js', '../client/public/**/*.js', 'app.js'], gulp.parallel('scripts'));
      gulp.watch('../client/public/stylesheets/**/*.css', gulp.parallel('styles'));
      gulp.watch('../client/public/**/*.js', browserSync.reload);
    })
);