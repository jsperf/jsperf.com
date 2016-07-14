var Lab = require('lab');
var Code = require('code');
var proxyquire = require('proxyquire');

var markdown = proxyquire('../../../../templates/helpers/markdown', {
  'marked': function () {
    return '<strong>word</strong>';
  }
});

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper markdown', function () {
  lab.test('returns marked safe string', function (done) {
    var res = markdown('*word*');

    Code.expect(res.toString()).to.equal('<strong>word</strong>');

    done();
  });
});
