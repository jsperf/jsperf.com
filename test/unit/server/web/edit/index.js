'use strict';

var path = require('path');
var Lab = require('lab');
var sinon = require('sinon');
var Code = require('code');
const Hoek = require('hoek');
var Hapi = require('hapi');
var proxyquire = require('proxyquire');
const defaults = require('../../../../../server/lib/defaults');
const testNow = new Date();
const defaultPageData = {
  id: 1,
  slug: 'wee',
  revision: 1,
  maxRev: 22,
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

var TestPlugin = proxyquire('../../../../../server/web/edit/index', {
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

lab.beforeEach(function (done) {
  var plugins = [ TestPlugin, YarPlugin ];
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

lab.experiment('GET', function () {
  const slug = 'wee';

  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      credentials: {'test': 'profile'},
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
      Code.expect(response.payload).to.include('<title>Oh Yea · jsPerf</title>');

      done();
    });
  });

  lab.test('it presents a login option to a user if they have not auth’d with GitHub', function (done) {
    pagesServiceStub.getBySlug.returns(
      Promise.resolve([defaultPageData, [], [], []])
    );

    delete request.credentials;

    server.inject(request, function (response) {
      Code.expect(response.result).to.include('Login with GitHub to Edit Test Cases');

      done();
    });
  });

  lab.test('it presents a save option to a user if they have already auth’d with GitHub', function (done) {
    pagesServiceStub.getBySlug.returns(
      Promise.resolve([defaultPageData, [], [], []])
    );

    server.inject(request, function (response) {
      Code.expect(response.result).to.include('Save test case');

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

  // Hapi does not support nested optional paramaters, this is the workaround
  lab.test('redirect slug/edit to slug/1/edit', function (done) {
    request.url = `/${slug}/edit`;
    pagesServiceStub.getBySlug.returns(
      Promise.resolve([defaultPageData, [], [], []])
    );

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.equal(`/${slug}/1/edit`);

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
      method: 'GET',
      path: '/setsession',
      config: {
        handler: function (req, reply) {
          var owns = {1: true};
          req.yar.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
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
      method: 'GET',
      path: '/setsession',
      config: {
        handler: function (req, reply) {
          var owns = {1: false};
          req.yar.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      var header = res.headers['set-cookie'];
      var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
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
      method: 'GET',
      path: '/setsession',
      config: {
        handler: function (req, reply) {
          let owns = {1: true};
          req.yar.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      const header = res.headers['set-cookie'];
      const cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
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
      method: 'GET',
      path: '/setsession',
      config: {
        handler: function (req, reply) {
          let owns = {1: false};
          req.yar.set('own', owns);
          return reply('session set');
        }
      }
    });
    server.inject('/setsession', function (res) {
      const header = res.headers['set-cookie'];
      const cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
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

lab.experiment('POST', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'POST',
      url: '/wee/1/edit',
      credentials: {'test': 'profile'},
      payload: {
        author: 'Pitcher Man',
        authorEmail: 'kool-aid@kraft.com',
        authorURL: 'http://kool-aid.com',
        title: 'oh',
        slug: 'oh-yea',
        info: '',
        initHTML: '',
        setup: '',
        teardown: '',
        test: [
          {
            title: 't1',
            code: 't=1'
          },
          {
            title: 't2',
            code: 't=2'
          }
        ]
      }
    };

    done();
  });

  lab.experiment('validation', function () {
    lab.test('title required', function (done) {
      delete request.payload.title;

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result).to.include(defaults.errors.title);

        done();
      });
    });

    lab.test('test title required', function (done) {
      delete request.payload.test[0].title;

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(400);

        Code.expect(response.result).to.include(defaults.errors.codeTitle);

        done();
      });
    });

    lab.test('test code required', function (done) {
      delete request.payload.test[0].code;

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(400);

        Code.expect(response.result).to.include(defaults.errors.code);

        done();
      });
    });

    lab.test('generic error', function (done) {
      request.payload.test[0].defer = 'unexpected';

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(400);

        Code.expect(response.result).to.include(defaults.errors.general);

        done();
      });
    });
  });

  lab.experiment('authorization', function () {
    lab.test('401 if attempting to POST without authorization', function (done) {
      delete request.credentials;

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(401);

        done();
      });
    });
  });

  lab.experiment('new revision', function () {
    lab.beforeEach(function (done) {
      pagesServiceStub.getBySlug = function (a, b) {
        request.payload.maxRev = 44;
        return Promise.resolve([request.payload]);
      };

      done();
    });

    lab.afterEach(function (done) {
      pagesServiceStub.getBySlug = function () {};
      pagesServiceStub.edit = function () {};

      done();
    });

    lab.test('handles error', function (done) {
      var errMsg = 'testing-very-very-unique-msg';
      pagesServiceStub.edit = function (a) {
        return Promise.reject(new Error(errMsg));
      };

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.payload).to.include('<title>oh · jsPerf</title>');
        Code.expect(response.result).to.include(errMsg);

        done();
      });
    });

    lab.test('calls edit page service with new revision params', function (done) {
      pagesServiceStub.edit = sinon.stub();
      pagesServiceStub.edit.onCall(0).returns(Promise.resolve(request.payload));

      server.inject(request, response => {
        let firstCallArgs = pagesServiceStub.edit.args[0];

        Code.expect(firstCallArgs[0].slug).to.equal(request.payload.slug);
        Code.expect(firstCallArgs[1]).to.equal(false);
        Code.expect(firstCallArgs[2]).to.equal(44);

        done();
      });
    });

    lab.test('redirects to new url after revision insertion', function (done) {
      pagesServiceStub.edit = sinon.stub();
      pagesServiceStub.edit.onCall(0).returns(Promise.resolve(request.payload));

      server.inject(request, response => {
        Code.expect(response.statusCode).to.equal(302);
        Code.expect(response.headers.location).to.equal(`/${request.payload.slug}/45`);

        done();
      });
    });
  });

  lab.experiment('owner revision', function () {
    lab.beforeEach(function (done) {
      pagesServiceStub.getBySlug = function (a, b) {
        return Promise.resolve([defaultPageData]);
      };

      server.route({
        method: 'GET',
        path: '/setsession',
        config: {
          handler: function (req, reply) {
            var owns = {1: true};
            req.yar.set('own', owns);
            return reply('session set');
          }
        }
      });

      done();
    });

    lab.afterEach(function (done) {
      pagesServiceStub.getBySlug = function () {};
      pagesServiceStub.edit = function () {};

      done();
    });

    lab.test('calls edit page service with update params', function (done) {
      pagesServiceStub.edit = sinon.stub();
      pagesServiceStub.edit.onCall(0).returns(Promise.resolve(request.payload));

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, response => {
          let firstCallArgs = pagesServiceStub.edit.args[0];

          Code.expect(firstCallArgs[0].slug).to.equal(request.payload.slug);
          Code.expect(firstCallArgs[1]).to.equal(true);
          Code.expect(firstCallArgs[2]).to.equal(22);

          done();
        });
      });
    });

    lab.test('redirects to original url after update', function (done) {
      pagesServiceStub.edit = sinon.stub();
      let stubPage = Hoek.applyToDefaults(request.payload, {revision: 1});
      pagesServiceStub.edit.onCall(0).returns(Promise.resolve(stubPage));

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, response => {
          Code.expect(response.statusCode).to.equal(302);
          Code.expect(response.headers.location).to.equal(`/${defaultPageData.slug}`);

          done();
        });
      });
    });
  });

  lab.experiment('admin revision', function () {
    lab.beforeEach(function (done) {
      pagesServiceStub.getBySlug = function (a, b) {
        return Promise.resolve([defaultPageData]);
      };

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

      done();
    });

    lab.afterEach(function (done) {
      pagesServiceStub.getBySlug = function () {};
      pagesServiceStub.edit = function () {};

      done();
    });

    lab.test('calls edit page service with update params', function (done) {
      pagesServiceStub.edit = sinon.stub();
      pagesServiceStub.edit.onCall(0).returns(Promise.resolve(request.payload));

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, response => {
          let firstCallArgs = pagesServiceStub.edit.args[0];

          Code.expect(firstCallArgs[0].slug).to.equal(request.payload.slug);
          Code.expect(firstCallArgs[1]).to.equal(true);
          Code.expect(firstCallArgs[2]).to.equal(22);

          done();
        });
      });
    });
  });
});
