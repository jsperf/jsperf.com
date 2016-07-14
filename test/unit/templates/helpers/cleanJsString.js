var Lab = require('lab');
var Code = require('code');

var cleanJsString = require('../../../../templates/helpers/cleanJsString');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper cleanJsString', function () {
  lab.test('Test jsesc', function (done) {
    Code.expect(cleanJsString('Ich ♥ Bücher')).to.equal('\'Ich \\u2665 B\\xFCcher\'');

    done();
  });

  lab.test('Remove <script>', function (done) {
    Code.expect(cleanJsString('<script>var i=0;</script>')).to.equal('\'<script>var i=0;<\\/script>\'');
    Code.expect(cleanJsString('<script>var i=0;')).to.equal('\'<script>var i=0;\'');
    Code.expect(cleanJsString('var i=0;</script>')).to.equal('\'var i=0;<\\/script>\'');

    done();
  });

  lab.test('Real example', function (done) {
    var cleanJs = 'var i = arr.length;' +
    'while (i--) {' +
    'arr[i].toLowerCase().replace(/[^a-z0-9-]+/g, \'-\').replace(/[-]+/g, \'-\').replace(/^-|-$/g, \'\');' +
    '};';
    var cleanJsExpected = '\'var i = arr.length;while (i--) {arr[i].toLowerCase().replace(/[^a-z0-9-]+/g, \\\'-\\\').replace(/[-]+/g, \\\'-\\\').replace(/^-|-$/g, \\\'\\\');};\'';
    Code.expect(cleanJsString(cleanJs)).to.equal(cleanJsExpected);

    done();
  });
});
