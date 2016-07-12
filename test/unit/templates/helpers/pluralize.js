var Lab = require('lab');
var Code = require('code');

var pluralize = require('../../../../templates/helpers/pluralize');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper pluralize', function () {
  lab.test('pluralizes term when num is zero', function (done) {
    Code.expect(pluralize(0, 'thing')).to.equal('0 things');

    done();
  });

  lab.test('keep term when num is one', function (done) {
    Code.expect(pluralize(1, 'thing')).to.equal('1 thing');

    done();
  });

  lab.test('pluralizes term when num is greater than one', function (done) {
    Code.expect(pluralize(2, 'thing')).to.equal('2 things');

    done();
  });
});
