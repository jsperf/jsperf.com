var Lab = require('lab');
var Code = require('code');

var inc = require('../../../templates/helpers/inc');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper inc', function () {
  lab.test('increments argument', function (done) {
    Code.expect(inc(1)).to.equal(2);

    done();
  });
});
