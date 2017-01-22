var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var GitHubPlugin = require('../../../../../server/web/auth/github');

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
      password: 'password-should-be-32-characters'
    });

    next();
  }
};
MockAuthGitHub.register.attributes = {
  name: 'github'
};

const YarPlugin = {
  register: require('yar'),
  options: { cookieOptions: { password: 'password-should-be-32-characters' } }
};

lab.experiment('auth/GitHub', function () {
  lab.beforeEach(function (done) {
    server = new Hapi.Server();

    server.connection();

    server.register([
      require('hapi-auth-cookie'),
      MockAuthGitHub,
      GitHubPlugin,
      YarPlugin
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

  lab.experiment('onPreResponse', () => {
    lab.beforeEach((done) => {
      server.register(require('vision'), (err) => {
        Code.expect(err).to.not.exist();

        server.views({
          engines: {
            hbs: require('handlebars')
          },
          path: __dirname,
          isCached: false
        });

        done();
      });
    });

    lab.test('does not populate credentials if not authenticated', (done) => {
      server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
          return reply.view('test');
        }
      });

      server.inject({ method: 'GET', url: '/' }, function (res) {
        Code.expect(res.result.trim()).to.equal('Hello');
        done();
      });
    });

    lab.test('populates credentials if authenticated', (done) => {
      const displayName = 'John';
      server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
          request.auth.isAuthenticated = true;
          request.auth.credentials = { displayName };
          return reply.view('test');
        }
      });

      server.inject({ method: 'GET', url: '/' }, function (res) {
        Code.expect(res.result.trim()).to.equal('Hello ' + displayName);
        done();
      });
    });

    lab.test('uses existing context', (done) => {
      server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
          return reply.view('test', { a: 1 });
        }
      });

      server.inject({ method: 'GET', url: '/' }, function (res) {
        Code.expect(res.result.trim()).to.equal('Hello 1');
        done();
      });
    });
  });
});
