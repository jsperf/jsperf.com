var Lab = require('lab');
var Code = require('code');

var datetoISOString = require('../../../../templates/helpers/DatetoISOString');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper DatetoISOString', function () {
  lab.test('converts Date to ISO String', function (done) {
    var d = new Date();
    Code.expect(datetoISOString(d)).to.equal(d.toISOString());

    done();
  });
});
