const Code = require('code');
const Lab = require('lab');
const Proxyquire = require('proxyquire');

const Composer = Proxyquire('../../index', {
  './manifest': {
    get: function () { return {}; },
    '@noCallThru': true
  }
});

const lab = exports.lab = Lab.script();

lab.experiment('Index', function () {
  lab.test('it composes a server', function (done) {
    Composer(function (err, server) {
      Code.expect(server).to.be.an.object();

      done(err);
    });
  });
});
