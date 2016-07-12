var Lab = require('lab');
var Code = require('code');

var relativeDate = require('../../../../templates/helpers/relativeDate');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper relativeDate', function () {
  var d;

  lab.before(function (done) {
    d = new Date();

    done();
  });

  lab.test('returns "just now" if less than 5 seconds ago', function (done) {
    Code.expect(relativeDate(d)).to.equal('just now');

    done();
  });

  lab.test('returns "$$ seconds ago" if less than a minute ago', function (done) {
    var thirtySeconds = 30 * 1000;
    d.setTime(Date.now() - thirtySeconds);

    Code.expect(relativeDate(d)).to.equal('30 seconds ago');

    done();
  });

  lab.test('returns "$$ minutes ago" if less than an hour ago', function (done) {
    var thirtyMinutes = 30 * 60 * 1000;
    d.setTime(Date.now() - thirtyMinutes);

    Code.expect(relativeDate(d)).to.equal('30 minutes ago');

    done();
  });

  lab.test('returns "$ hour ago" if one hour ago', function (done) {
    // provides coverage to `else` in niceTime
    var oneHours = 1 * 60 * 60 * 1000;
    d.setTime(Date.now() - oneHours);

    Code.expect(relativeDate(d)).to.equal('1 hour ago');

    done();
  });

  lab.test('returns "$$ hours ago" if less than a day ago', function (done) {
    var twoHours = 2 * 60 * 60 * 1000;
    d.setTime(Date.now() - twoHours);

    Code.expect(relativeDate(d)).to.equal('2 hours ago');

    done();
  });

  lab.test('returns "$$ days ago" if less than a week ago', function (done) {
    var twoDays = 2 * 24 * 60 * 60 * 1000;
    d.setTime(Date.now() - twoDays);

    Code.expect(relativeDate(d)).to.equal('2 days ago');

    done();
  });

  lab.test('returns "$$ weeks ago" if less than a month ago', function (done) {
    var twoDays = 2 * 7 * 24 * 60 * 60 * 1000;
    d.setTime(Date.now() - twoDays);

    Code.expect(relativeDate(d)).to.equal('2 weeks ago');

    done();
  });

  lab.test('returns "on $locale" if more than a month ago', function (done) {
    d.setFullYear(1999);
    d.setMonth(11);
    d.setDate(31);

    Code.expect(relativeDate(d)).to.equal('on ' + d.toLocaleDateString());

    done();
  });
});
