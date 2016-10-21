var Lab = require('lab');
var Code = require('code');

var addCode = require('../../../../templates/helpers/addCode');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper addCode', function () {
  lab.test('replaces a set of backticks with code markup', function (done) {
    var res = addCode('My `pretty` title');
    Code.expect(res).to.be.an.object();
    Code.expect(res.string).to.equal('My <code>pretty</code> title');

    done();
  });

  lab.test('replaces multiple sets of backticks with code markup', function (done) {
    var res = addCode('My `pretty` title with multiple `code` spans');
    Code.expect(res).to.be.an.object();
    Code.expect(res.string).to.equal('My <code>pretty</code> title with multiple <code>code</code> spans');

    done();
  });
});
