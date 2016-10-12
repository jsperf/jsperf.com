'use strict';

// mostly copy-pasta from https://github.com/jsperf/benchmark.js-wrapper/blob/c84d86d3a6a15a94a1acb2b99ec24562adfa1d27/gulpfile.js

const gulp = require('gulp');

const addSrc = require('gulp-add-src');
const concat = require('gulp-concat');
const insert = require('gulp-insert');
const remoteSrc = require('gulp-remote-src');
const replace = require('gulp-replace');
// const uglify = require('gulp-uglify');

const BENCHMARKJS_VERSION = require('./package.json').devDependencies.benchmark;

gulp.task('js', function () {
  /*
    Put together in order:
    1. lodash
    2. platform
    3. benchmark
    4. ui.js
    5. ui.browserscope.js
  */
  remoteSrc([
    `bestiejs/benchmark.js/${BENCHMARKJS_VERSION}/plugin/ui.browserscope.js`
  ], {
    base: 'https://raw.githubusercontent.com/',
    requestOptions: {
      gzip: true,
      strictSSL: true
    }
  })

  // list in reverse order since prepending
  // use `require.resolve` so you get file path and not file contents
  .pipe(addSrc.prepend('client/ui.js'))
  .pipe(addSrc.prepend(require.resolve('benchmark')))
  .pipe(addSrc.prepend(require.resolve('platform')))
  .pipe(addSrc.prepend(require.resolve('lodash')))

  .pipe(concat('test.js'))

  // Set the Google Analytics ID.
  .pipe(replace('gaId = \'\'', 'gaId = \'UA-6065217-40\''))

  // jsPerf is browser-only. Ensure we’re detected as a browser environment,
  // even if this is an AMD test, for example.
  .pipe(replace(/freeDefine = (?:[^;]+)/, 'freeDefine = false'))
  .pipe(replace(/freeExports = (?:[^;]+)/, 'freeExports = false'))
  .pipe(replace(/freeModule = (?:[^;]+)/, 'freeModule = false'))
  .pipe(replace(/freeRequire = (?:[^;]+)/, 'freeRequire = false'))
  .pipe(replace(/(if\s*\()(typeof define|freeDefine)\b/, '$1false'))

  // Set the CSS selector for the Browserscope results.
  .pipe(replace('\'selector\': \'\'', '\'selector\': \'#bs-results\''))

  // Avoid exposing `_` and `platform` as global variables.
  .pipe(insert.wrap(
    '(function(){var _,platform;',
    '}.call(this))'
  ))
  .pipe(replace('root.platform = parse()', 'platform = parse()'))
  .pipe(replace('var _ = runInContext()', '_ = runInContext()'))
  .pipe(replace('var _ = context && context._ || require(\'lodash\') || root._;', ''))
  .pipe(replace('(freeWindow || freeSelf || {})._ = _', ''))
  .pipe(replace('root._ = _', ''))

  // Ensure that Benchmark.js uses the local copies of lodash and Platform.js.
  .pipe(replace('var _ = context && context._ || req(\'lodash\') || root._;', ''))
  .pipe(replace('\'platform\': context.platform', '\'platform\': platform'))

  // Minify the result.
  // .pipe(uglify())

  .pipe(gulp.dest('./public/_js/'));
});

gulp.task('default', ['js']);
