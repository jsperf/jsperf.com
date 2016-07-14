var Code = require('code');
var Lab = require('lab');
var Proxyquire = require('proxyquire');

var Composer = Proxyquire('../../index', {
  './manifest': {
    get: function () { return {}; }
  }
});

var lab = exports.lab = Lab.script();

lab.experiment('Index', function () {
  lab.test('it composes a server', function (done) {
    Composer(function (err, server) {
      Code.expect(server).to.be.an.object();

      done(err);
    });
  });
});
