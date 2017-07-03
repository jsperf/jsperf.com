const path = require('path');
const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const SearchPlugin = require('../../../../../server/web/search/index');

const MockPagesService = {
  register: (server, options, next) => {
    server.expose('find', function () {});
    next();
  }
};

MockPagesService.register.attributes = {
  name: 'services/pages'
};

const lab = exports.lab = Lab.script();
let request, server, pagesServiceStub;

lab.beforeEach(function (done) {
  server = new Hapi.Server();
  server.connection();
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
      MockPagesService,
      SearchPlugin
    ], (err) => {
      if (err) return done(err);

      sinon.stub(server.plugins['services/pages'], 'find').callsFake(() => pagesServiceStub);

      done();
    });
  });
});

lab.experiment('search', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/search'
    };

    done();
  });

  lab.test('it responds with search form', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        'Search jsPerf',
        '<form'
      ]);

      done();
    });
  });

  lab.test('it responds with search form from empty form submission', function (done) {
    request.url += '?q=';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        'Search jsPerf',
        '<form'
      ]);

      done();
    });
  });

  lab.test('it responds with an error from querying', function (done) {
    pagesServiceStub = Promise.reject(new Error());

    request.url += '?q=a';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });

  lab.test('it responds with no results from querying', function (done) {
    pagesServiceStub = Promise.resolve([]);

    request.url += '?q=a';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include('No results found for query: ');

      done();
    });
  });

  lab.test('it responds with search results', function (done) {
    var currentTime = new Date();
    var testUrl = 'http://example.com';
    var testTitle = 'Test result';
    pagesServiceStub = Promise.resolve([{
      url: testUrl,
      revision: 1,
      title: testTitle,
      revisionCount: 1,
      testCount: 1,
      updated: currentTime
    }]);

    request.url += '?q=test';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        testUrl,
        testTitle,
        currentTime.toISOString()
      ]);
      done();
    });
  });

  lab.experiment('atom', function () {
    lab.test('it ignores non-atom extensions', function (done) {
      request.url += '.php';

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('it responds w/ atom feed', function (done) {
      var currentTime = new Date();
      var testUrl = 'http://example.com';
      var testTitle = 'Test result';
      pagesServiceStub = Promise.resolve([{
        url: testUrl,
        revision: 1,
        title: testTitle,
        revisionCount: 1,
        testCount: 1,
        updated: currentTime,
        published: currentTime
      }]);

      request.url += '.atom?q=test';

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.include([
          '<title>' + testTitle + '</title>'
        ]);
        done();
      });
    });
  });
});
