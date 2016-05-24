'use strict';

var path = require('path');
var Lab = require('lab');
var sinon = require('sinon');
var Code = require('code');
const Hoek = require('hoek');
var Hapi = require('hapi');
var proxyquire = require('proxyquire');

var Config = require('../../../../config');
const testNow = new Date();
const defaultPageData = {
  id: 1,
  slug: 'wee',
  revision: 1,
  browserscopeID: 'abc123',
  title: 'Oh Yea',
  info: 'Sample test',
  setup: 'samplesetup',
  teardown: 'deletesetup',
  initHTML: 'initstring',
  visible: 'y',
  author: 'Andrew',
  authorEmail: 'a@s.co',
  authorURL: 'as.co',
  hits: 0,
  published: testNow,
  updated: testNow
};

var pagesServiceStub = {
  updateHits: function () {},
  getBySlug: function () {}
};
var debugSpy = sinon.spy();

var TestPlugin = proxyquire('../../../../server/web/edit/index', {
  '../../services/pages': pagesServiceStub,
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

lab.beforeEach(function (done) {
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

lab.experiment('edit', function () {
  const slug = 'wee';

  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: `/${slug}/1/edit`
    };

    pagesServiceStub.getBySlug = sinon.stub();
    pagesServiceStub.updateHits = sinon.stub().returns(Promise.resolve());

    done();
  });

  lab.test('fail to get by slug', function (done) {
    pagesServiceStub.getBySlug.returns(Promise.reject(new Error('real helpful')));

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });

  lab.test('responds with test page for slug', function (done) {
    pagesServiceStub.getBySlug.returns(
      Promise.resolve([defaultPageData, [], [], []])
    );

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });

  lab.test('visible page warning if page is visible', function (done) {
    pagesServiceStub.getBySlug.returns(
      Promise.resolve([defaultPageData, [], [], []])
    );

    server.inject(request, function (response) {
      Code.expect(response.payload.indexOf('uncheck if you want to fiddle around before making the page public')).to.be.at.least(0);

      done();
    });
  });

  lab.test('not found', function (done) {
    pagesServiceStub.getBySlug.returns(Promise.reject(new Error('Not found')));

    // adding revision to url here covers true case of rev ternary
    request.url = '/wee/999/edit';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(404);

      done();
    });
  });

  lab.test('displays all pertinent page info', function (done) {
    pagesServiceStub.getBySlug.returns(
      Promise.resolve([defaultPageData, [], [], []])
    );

    server.inject(request, function (response) {
      Code.expect(response.payload.indexOf(defaultPageData.info)).to.be.at.least(0);
      Code.expect(response.payload.indexOf(defaultPageData.setup)).to.be.at.least(0);
      Code.expect(response.payload.indexOf(defaultPageData.teardown)).to.be.at.least(0);
      Code.expect(response.payload.indexOf(defaultPageData.initHTML)).to.be.at.least(0);

      done();
    });
  });

  lab.test('give the user a visible page prompt if page is not visible', function (done) {
    const nonVisiblePage = Hoek.applyToDefaults(defaultPageData, {visible: 'n'});
    pagesServiceStub.getBySlug.returns(
      Promise.resolve([nonVisiblePage, [], [], []])
    );

    server.inject(request, function (response) {
      Code.expect(response.payload.indexOf('check when your test case is finished')).to.be.at.least(0);

      done();
    });
  });

  lab.test('responds with "editing original" message for the original author', function (done) {
    server.route({
      method: 'GET', path: '/setsession',
      config: {
        handler: function (req, reply) {
          var owns = {1: true};
          req.session.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/);
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];
      pagesServiceStub.getBySlug.returns(
        Promise.resolve([defaultPageData, [], [], []])
      );
      server.inject(request, function (response) {
        Code.expect(response.payload.indexOf('Since it’s your test case, this edit will overwrite the current revision without creating a new URL')).to.be.at.least(0);

        done();
      });
    });
  });

  lab.test('displays an "creating new revision" message for not the author', function (done) {
    server.route({
      method: 'GET', path: '/setsession',
      config: {
        handler: function (req, reply) {
          var owns = {1: false};
          req.session.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/);
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];
      pagesServiceStub.getBySlug.returns(
        Promise.resolve([defaultPageData, [], [], []])
      );
      server.inject(request, function (response) {
        Code.expect(response.payload.indexOf('This edit will create a new revision.')).to.be.at.least(0);

        done();
      });
    });
  });

  lab.test("it displays the author's details name if being viewed by an admin", function (done) {
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
      pagesServiceStub.getBySlug.returns(
        Promise.resolve([defaultPageData, [], [], []])
      );
      server.inject(request, function (response) {
        Code.expect(response.payload.indexOf('Andrew')).to.be.at.least(0);
        Code.expect(response.payload.indexOf('a@s.co')).to.be.at.least(0);
        Code.expect(response.payload.indexOf('as.co')).to.be.at.least(0);

        done();
      });
    });
  });

  lab.test("it displays the author's details if being viewed by the author", function (done) {
    server.route({
      method: 'GET', path: '/setsession',
      config: {
        handler: function (req, reply) {
          let owns = {1: true};
          req.session.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      const header = res.headers['set-cookie'];
      const cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/);
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];
      pagesServiceStub.getBySlug.returns(
        Promise.resolve([defaultPageData, [], [], []])
      );
      server.inject(request, function (response) {
        Code.expect(response.payload.indexOf('Andrew')).to.be.at.least(0);
        Code.expect(response.payload.indexOf('a@s.co')).to.be.at.least(0);
        Code.expect(response.payload.indexOf('as.co')).to.be.at.least(0);

        done();
      });
    });
  });

  lab.test("it does not display the author's details if not being viewed by the author or an admin", function (done) {
    server.route({
      method: 'GET', path: '/setsession',
      config: {
        handler: function (req, reply) {
          let owns = {1: false};
          req.session.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      const header = res.headers['set-cookie'];
      const cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/);
      request.headers = {};
      request.headers.cookie = 'session=' + cookie[1];
      pagesServiceStub.getBySlug.returns(
        Promise.resolve([defaultPageData, [], [], []])
      );
      server.inject(request, function (response) {
        Code.expect(response.payload.indexOf('Andrew')).to.equal(-1);
        Code.expect(response.payload.indexOf('a@s.co')).to.be.at.least(-1);
        Code.expect(response.payload.indexOf('as.co')).to.be.at.least(-1);

        done();
      });
    });
  });
});
