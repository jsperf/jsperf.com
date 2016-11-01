'use strict';

var path = require('path');
var Lab = require('lab');
var sinon = require('sinon');
var Code = require('code');
var Hapi = require('hapi');
var proxyquire = require('proxyquire');

var pagesServiceStub = {
  deleteBySlug: () => {}
};

var DeletePlugin = proxyquire('../../../../../server/web/delete/index', {
  '../../services/pages': pagesServiceStub
});

var YarPlugin = {
  register: require('yar'),
  options: { cookieOptions: { password: 'password-should-be-32-characters' } }
};

var AuthPlugin = {
  register: require('hapi-auth-cookie'),
  options: {}
};

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(done => {
  var plugins = [ DeletePlugin, YarPlugin ];
  server = new Hapi.Server();

  server.connection();

  server.register([ AuthPlugin ], function () {
    server.auth.strategy('session', 'cookie', {
      password: 'testing',
      cookie: 'sid-jsperf',
      redirectTo: false,
      isSecure: false
    });
  });

  server.register(require('vision'), () => {
    server.views({
      engines: {
        hbs: require('handlebars')
      },
      path: './server/web',
      layout: true,
      helpersPath: 'templates/helpers',
      partialsPath: 'templates/partials',
      relativeTo: path.join(__dirname, '..', '..', '..', '..', '..')
    });
    server.register(plugins, done);
  });
});

lab.experiment('deleting', function () {
  lab.beforeEach(done => {
    request = {
      method: 'GET',
      url: '/test-slug/1/delete'
    };

    done();
  });

  lab.test('while being unauthorized', done => {
    server.inject(request, response => {
      Code.expect(response.statusCode).to.equal(401);

      done();
    });
  });

  lab.test('multiple revisions while being admin', done => {
    pagesServiceStub.deleteBySlug = sinon.stub().returns(Promise.resolve(3));

    server.route({
      method: 'GET',
      path: '/setsession',
      config: {
        handler: function (req, reply) {
          req.yar.set('admin', true);
          return reply('session set');
        }
      }
    });

    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.include('Deleted 3 revisions');

        done();
      });
    });
  });

  lab.test('a single revision while being admin', done => {
    pagesServiceStub.deleteBySlug = sinon.stub().returns(Promise.resolve(1));

    server.route({
      method: 'GET',
      path: '/setsession',
      config: {
        handler: function (req, reply) {
          req.yar.set('admin', true);
          return reply('session set');
        }
      }
    });

    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];
      request.url = '/test-slug/23/delete';

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.include('Deleted revision 23');

        done();
      });
    });
  });

  lab.test('a revision that does not exist while being admin', done => {
    pagesServiceStub.deleteBySlug = sinon.stub().returns(Promise.resolve(0));

    server.route({
      method: 'GET',
      path: '/setsession',
      config: {
        handler: function (req, reply) {
          req.yar.set('admin', true);
          return reply('session set');
        }
      }
    });

    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.include('Could not delete');

        done();
      });
    });
  });
});
