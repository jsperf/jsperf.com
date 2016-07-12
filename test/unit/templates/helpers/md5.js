var Lab = require('lab');
var Code = require('code');

var md5 = require('../../../../templates/helpers/md5');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper md5', function () {
  lab.test('returns md5 hex', function (done) {
    Code.expect(md5('jsperf.com')).to.equal('69ea3eefe5b65c46e2c3c281337cf305');

    done();
  });
});
