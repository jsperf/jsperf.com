const Lab = require('lab');
const Code = require('code');
const markdown = require('../../../../templates/helpers/markdown');

const { experiment, test } = exports.lab = Lab.script();

experiment('Template Helper markdown', function () {
  test('returns marked safe string', function (done) {
    const res = markdown('hello **world**');

    Code.expect(res.toString()).to.equal('<p>hello <strong>world</strong></p>\n');

    done();
  });
});
