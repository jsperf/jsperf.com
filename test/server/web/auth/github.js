var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var GitHubPlugin = require('../../../../server/web/auth/github');

var lab = exports.lab = Lab.script();
var request, server;

var MockAuthGitHub = {
  register: function (server, options, next) {
    server.auth.scheme('MockGitHub', function (s, o) {
      return {
        authenticate: function (request, reply) {}
      };
    });

    server.auth.strategy('github', 'MockGitHub');
    server.auth.strategy('session', 'cookie', {
      password: 'testing'
    });

    next();
  }
};
MockAuthGitHub.register.attributes = {
  name: 'github'
};

lab.experiment('auth/GitHub', function () {
  lab.beforeEach(function (done) {
    server = new Hapi.Server();

    server.connection();

    server.register([
      require('hapi-auth-cookie'),
      MockAuthGitHub,
      GitHubPlugin
    ], done);
  });

  lab.experiment('GET', function () {
    lab.beforeEach(function (done) {
      request = {
        method: 'GET',
        url: '/auth/github'
      };

      done();
    });

    lab.test('sets auth credentials profile to session and redirects', function (done) {
      request.credentials = {profile: {'name': 'test'}};

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(302);

        done();
      });
    });
  });
});
