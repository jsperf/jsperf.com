var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var Config = require('../../../../config');

var AuthPlugin = {
  register: require('bell'),
  options: {}
};

var AuthCookiePlugin = {
  register: require('hapi-auth-cookie'),
  options: {}
};

var StrategiesPlugin = {
  register: require('../../../../server/web/auth/strategies'),
  options: {}
};

var GitHubRoutePlugin = {};
GitHubRoutePlugin.register = function (localserv, options, next) {
  localserv.route({
    method: 'GET',
    path: '/test/github',
    config: {
      auth: 'github',
      handler: function (req, rep) {
        return rep('works');
      }
    }
  });

  return next();
};

GitHubRoutePlugin.register.attributes = {
  name: 'web/auth/strategies/test/github'
};

var CookieRoutePlugin = {};
CookieRoutePlugin.register = function (localserv, options, next) {
  localserv.route({
    method: 'GET',
    path: '/test/cookie',
    config: {
      auth: 'session',
      handler: function (req, rep) {
        return rep('works');
      }
    }
  });
  return next();
};

CookieRoutePlugin.register.attributes = {
  name: 'web/auth/strategies/test/cookie'
};

var plugins = [ StrategiesPlugin, CookieRoutePlugin, GitHubRoutePlugin ];
var lab = exports.lab = Lab.script();
var server;

lab.beforeEach(function (done) {
  server = new Hapi.Server();

  server.connection({
    port: Config.get('/port/web')
  });

  server.register([ AuthCookiePlugin, AuthPlugin ], function () {
    server.register(plugins, done);
  });
});

lab.experiment('strategies', function () {
  lab.experiment('github strategy', function () {
    lab.test('auth to 200 if all is good', function (done) {
      Code.expect(function () {
        server.inject('/test/cookie', function () {
          done();
        });
      }).to.not.throw();
    });
  });
});
