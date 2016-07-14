var Lab = require('lab');
var Code = require('code');

const defaults = require('../../../../server/lib/defaults');

var lab = exports.lab = Lab.script();

lab.experiment('Base Object Library', function () {
  lab.experiment('mediumTextLength', function () {
    lab.test('is a number', function (done) {
      Code.expect(defaults.mediumTextLength).to.be.a.number();

      done();
    });
  });

  lab.experiment('default test object', function () {
    lab.test('is an object', function (done) {
      Code.expect(defaults.test).to.be.a.object();

      done();
    });
  });

  lab.experiment('test page context', function () {
    lab.test('is an object', function (done) {
      Code.expect(defaults.testPageContext).to.be.a.object();

      done();
    });
  });
});
