var Lab = require('lab');
var Hapi = require('hapi');

var StrategiesPlugin = {
  register: require('../../../../server/web/auth/strategies'),
  options: {
    session: {
      password: 'testing',
      cookie: 'jsperf',
      isSecure: true
    },
    oauth: {
      password: 'test1',
      clientId: 'fromGH',
      clientSecret: 's3cr3t',
      isSecure: true,
      location: 'http://localhost'
    }
  }
};

var lab = exports.lab = Lab.script();
var server;

lab.experiment('strategies', function () {
  lab.test('registers auth strategies', function (done) {
    server = new Hapi.Server();

    server.connection();

    server.register([
      require('hapi-auth-cookie'),
      require('bell'),
      StrategiesPlugin
    ], done);
  });
});
