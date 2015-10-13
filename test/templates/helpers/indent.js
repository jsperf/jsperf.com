var Lab = require('lab');
var Code = require('code');

var indent = require('../../../templates/helpers/indent');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper indent', function () {
  lab.test('indents each new line two spaces', function (done) {
    Code.expect(indent('some\nplain\ntext')).to.equal('  some\n  plain\n  text');

    done();
  });
});
