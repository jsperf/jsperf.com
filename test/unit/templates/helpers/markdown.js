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

  test('remove script tags', function (done) {
    const res = markdown('<script language="javascript">window.location.href = "http://example.com"</script>');

    Code.expect(res.toString()).to.equal('');

    done();
  });

  test('remove CDATA scripts', function (done) {
    const res = markdown(`<script type="text/javascript">// <![CDATA[
           window.location = "http://example.com/"
// ]]></script>`);

    Code.expect(res.toString()).to.equal('');

    done();
  });

  test('remove malicious img tag', function (done) {
    const res = markdown('<img alt="" onerror="document.location=\'http://example.com/\';" src="goodlion80_files/sfs.htm" />');

    Code.expect(res.toString()).to.equal('<img alt src="goodlion80_files/sfs.htm" />');

    done();
  });

  test('remove meta refresh tag', function (done) {
    const res = markdown(`<meta http-equiv="refresh" content="0;http://example.com"/>`);

    Code.expect(res.toString()).to.equal('<meta content="0;http://example.com" />');

    done();
  });
});
