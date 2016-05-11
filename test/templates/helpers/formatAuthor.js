var Lab = require('lab');
var Code = require('code');

var formatAuthor = require('../../../templates/helpers/formatAuthor');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper formatAuthor', function () {
  lab.test('returns empty string if given empty name', function (done) {
    Code.expect(formatAuthor('').toString()).to.equal('');

    done();
  });

  lab.test('follow Mathias links', function (done) {
    Code.expect(formatAuthor('Mathias', 'https://mathiasbynens.be/').toString()).to.not.include('nofollow');

    done();
  });

  lab.test('no url', function (done) {
    Code.expect(formatAuthor('Max').toString()).to.not.include('nofollow');

    done();
  });
});
