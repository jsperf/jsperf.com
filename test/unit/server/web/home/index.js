var path = require('path');

var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');
var proxyquire = require('proxyquire');

var pagesServiceStub = {
  checkIfSlugAvailable: function () {},
  create: function () {}
};

var HomePlugin = proxyquire('../../../../../server/web/home/index', {
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
  var plugins = [ HomePlugin, YarPlugin ];
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
      lab.afterEach(function (done) {
        pagesServiceStub.checkIfSlugAvailable = function () {};

        done();
      });

      lab.test('handles error', function (done) {
        var errMsg = 'testing-very-unique-msg';
        pagesServiceStub.checkIfSlugAvailable = () => Promise.reject(new Error(errMsg));

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include(errMsg);

          done();
        });
      });

      lab.test('not available', function (done) {
        pagesServiceStub.checkIfSlugAvailable = () => Promise.resolve(false);

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include('This slug is already in use. Please choose another one.');

          done();
        });
      });
    });

    lab.experiment('create page', function () {
      lab.beforeEach(function (done) {
        pagesServiceStub.checkIfSlugAvailable = function (a, b) {
          return Promise.resolve(true);
        };

        done();
      });

      lab.afterEach(function (done) {
        pagesServiceStub.checkIfSlugAvailable = function () {};
        pagesServiceStub.create = function () {};

        done();
      });

      lab.test('handles error', function (done) {
        var errMsg = 'testing-very-very-unique-msg';
        pagesServiceStub.create = function (a) {
          return Promise.reject(new Error(errMsg));
        };

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include(errMsg);

          done();
        });
      });

      lab.test('redirects to slug', function (done) {
        pagesServiceStub.create = function (a) {
          return Promise.resolve();
        };

        server.inject(request, function (response) {
          Code.expect(response.statusCode).to.equal(302);
          Code.expect(response.headers.location).to.include(request.payload.slug);

          done();
        });
      });
    });
  });
});
