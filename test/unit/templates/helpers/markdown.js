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

  test('remove script tags and stuff', function (done) {
    const res = markdown('<script language="javascript">window.location.href = "http://filmbuzz.top/signup.php"</script>');
    console.log(res.toString());

    Code.expect(res.toString()).to.equal('');
    done();
  });
});
