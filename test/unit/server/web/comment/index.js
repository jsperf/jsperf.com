'use strict';

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const commentsServiceMock = {};

const CommentPlugin = proxyquire('../../../../../server/web/comment', {
  '../../services/comments': commentsServiceMock
});

const cookiePass = 'password-should-be-32-characters';

const YarPlugin = {
  register: require('yar'),
  options: { cookieOptions: { password: cookiePass } }
};

const AuthPlugin = {
  register: require('hapi-auth-cookie'),
  options: {}
};

const lab = exports.lab = Lab.script();
let s;
let server;

lab.beforeEach(function (done) {
  s = sinon.sandbox.create();

  server = new Hapi.Server();
  server.connection();
  server.register([ AuthPlugin ], () => {
    server.auth.strategy('session', 'cookie', {
      password: cookiePass
    });

    server.register([ YarPlugin, CommentPlugin ], done);
  });
});

lab.afterEach((done) => {
  s.restore();
  done();
});

lab.experiment('comment', () => {
  let request;

  lab.experiment('delete', () => {
    lab.beforeEach((done) => {
      request = {
        method: 'GET',
        url: '/comment/delete/{commentId}'
      };
      done();
    });

    lab.test('unauthorized if not admin', (done) => {
      // admin session not set
      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(401);

        done();
      });
    });

    lab.test('if admin', (done) => {
      commentsServiceMock.delete = s.stub().returns(Promise.resolve());

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
          Code.expect(response.result).to.include('Comment deleted');

          done();
        });
      });
    });
  });
});
