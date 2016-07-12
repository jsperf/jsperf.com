'use strict';

var path = require('path');
var Lab = require('lab');
var sinon = require('sinon');
var Code = require('code');
var Hapi = require('hapi');
var proxyquire = require('proxyquire');
var Config = require('../../../../config');

var commentsServiceStub = {
  delete: () => {}
};
var debugSpy = sinon.spy();

var TestPlugin = proxyquire('../../../../server/web/comment/index', {
  '../../services/comments': commentsServiceStub,
  'debug': function () { return debugSpy; }
});

var YarPlugin = {
  register: require('yar'),
  options: { cookieOptions: { password: 'testing' } }
};

var AuthPlugin = {
  register: require('hapi-auth-cookie'),
  options: {}
};

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(done => {
  var plugins = [ TestPlugin, YarPlugin ];
  server = new Hapi.Server();

  server.connection({
    port: Config.get('/port/web')
  });

  server.register([ AuthPlugin ], function () {
    server.auth.strategy('session', 'cookie', {
      password: 'testing',
      cookie: 'sid-jsperf',
      redirectTo: false,
      isSecure: false
    });
  });

  server.views({
    engines: {
      hbs: require('handlebars')
    },
    helpersPath: 'templates/helpers',
    path: './server/web',
    relativeTo: path.join(__dirname, '..', '..', '..', '..')
  });

  server.register(plugins, done);
});

lab.experiment('/comment/delete/commentId', function () {
  lab.beforeEach(done => {
    request = {
      method: 'GET',
      url: '/comment/delete/1'
    };

    commentsServiceStub.delete = sinon.stub().returns(Promise.resolve());

    done();
  });

  lab.test('unauthorized', done => {
    server.inject(request, response => {
      Code.expect(response.statusCode).to.equal(401);

      done();
    });
  });

  lab.test('not admin', done => {
    request.credentials = {test: 'profile'};

    server.inject(request, response => {
      Code.expect(response.statusCode).to.equal(401);

      done();
    });
  });

  lab.test('admin', done => {
    server.route({
      method: 'GET', path: '/setsession',
      config: {
        handler: function (req, reply) {
          req.session.set('admin', true);
          return reply('session set');
        }
      }
    });

    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/);
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.include('Comment deleted');

        done();
      });
    });
  });
});
