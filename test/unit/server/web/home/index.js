const path = require('path');
const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const HomePlugin = require('../../../../../server/web/home/index');

const YarPlugin = {
  register: require('yar'),
  options: { cookieOptions: { password: 'password-should-be-32-characters' } }
};

const AuthPlugin = {
  register: require('hapi-auth-cookie'),
  options: {}
};

const MockPagesService = {
  register: (server, options, next) => {
    server.expose('checkIfSlugAvailable', function () {});
    server.expose('create', function () {});
    next();
  }
};

MockPagesService.register.attributes = {
  name: 'services/pages'
};

const lab = exports.lab = Lab.script();
let request, server;

lab.beforeEach(function (done) {
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
    server.register([
      YarPlugin,
      MockPagesService,
      HomePlugin
    ], done);
  });
});

lab.experiment('home', function () {
  lab.experiment('GET', function () {
    lab.beforeEach(function (done) {
      request = {
        method: 'GET',
        url: '/'
      };

      done();
    });

    lab.test('it responds with the home page', function (done) {
      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200);

        done();
      });
    });

    lab.test('it serves a generic title on pages that does not specify one', function (done) {
      server.inject(request, function (response) {
        Code.expect(response.payload).to.include('<title>jsPerf: JavaScript performance playground</title>');

        done();
      });
    });

    lab.test('it presents a login option to a user if they have not auth’d with GitHub', function (done) {
      server.inject(request, function (response) {
        Code.expect(response.result).to.include('Login with GitHub to Create Test Cases');

        done();
      });
    });

    lab.test('it presents a save option to a user if they have already auth’d with GitHub', function (done) {
      request.credentials = {'test': 'profile'};

      server.inject(request, function (response) {
        Code.expect(response.result).to.include('Save test case');
        Code.expect(response.payload).to.include('<script src="/public/_js/main.');

        done();
      });
    });
  });

  lab.experiment('POST', function () {
    lab.beforeEach(function (done) {
      request = {
        method: 'POST',
        url: '/',
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

          Code.expect(response.result).to.include('You must enter a title for this test case.');

          done();
        });
      });

      lab.test('slug required', function (done) {
        delete request.payload.slug;

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include('The slug can only contain alphanumeric characters and hyphens.');

          done();
        });
      });

      lab.test('test title required', function (done) {
        delete request.payload.test[0].title;

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include('Please enter a title for this code snippet.');

          done();
        });
      });

      lab.test('test code required', function (done) {
        delete request.payload.test[0].code;

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include('Please enter a code snippet.');

          done();
        });
      });

      lab.test('generic error', function (done) {
        request.payload.test[0].defer = 'unexpected';

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include('Please review required fields and save again.');

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

    lab.experiment('slug check', function () {
      lab.test('handles error', function (done) {
        const errMsg = 'testing-very-unique-msg';
        sinon.stub(server.plugins['services/pages'], 'checkIfSlugAvailable').returns(Promise.resolve(true));
        sinon.stub(server.plugins['services/pages'], 'create').throws(new Error(errMsg));

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include(errMsg);

          done();
        });
      });

      lab.test('not available', function (done) {
        sinon.stub(server.plugins['services/pages'], 'checkIfSlugAvailable').returns(Promise.resolve(false));

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include('This slug is already in use. Please choose another one.');

          done();
        });
      });
    });

    lab.experiment('create page', function () {
      lab.beforeEach(function (done) {
        sinon.stub(server.plugins['services/pages'], 'checkIfSlugAvailable').returns(Promise.resolve(true));

        done();
      });

      lab.test('handles error', function (done) {
        var errMsg = 'testing-very-very-unique-msg';
        sinon.stub(server.plugins['services/pages'], 'create').throws(new Error(errMsg));

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include(errMsg);

          done();
        });
      });

      lab.test('redirects to slug', function (done) {
        sinon.stub(server.plugins['services/pages'], 'create').returns(Promise.resolve(true));

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(302);
          Code.expect(response.headers.location).to.include(request.payload.slug);

          done();
        });
      });
    });
  });
});
