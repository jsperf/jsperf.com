var Lab = require('lab');
var Code = require('code');

var author = require('../../../templates/helpers/author');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper author', function () {
  lab.test('returns empty string if given empty name', function (done) {
    Code.expect(author('').toString()).to.equal('');

    done();
  });

  lab.test('follow Mathias links', function (done) {
    Code.expect(author('Mathias', 'https://mathiasbynens.be/').toString()).to.not.include('nofollow');

    done();
  });
});
