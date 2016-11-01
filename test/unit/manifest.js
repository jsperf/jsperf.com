const Lab = require('lab');
const Code = require('code');
const Proxyquire = require('proxyquire');

const Manifest = Proxyquire('../../manifest', {
  './config': {
    get: function () { return {}; },
    '@noCallThru': true
  }
});

const lab = exports.lab = Lab.script();

lab.experiment('Manifest', function () {
  lab.test('it gets manifest data', function (done) {
    Code.expect(Manifest.get('/')).to.be.an.object();
    done();
  });

  lab.test('it gets manifest meta data', function (done) {
    Code.expect(Manifest.meta('/')).to.match(/jsPerf/i);
    done();
  });
});
