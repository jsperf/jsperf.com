var path = require('path');

var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');
var proxyquire = require('proxyquire');

var pagesServiceStub = {};

var PopularPlugin = proxyquire('../../../../../server/web/popular/index', {
  '../../services/pages': pagesServiceStub
});

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ PopularPlugin ];
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
    server.register(plugins, done);
  });
});

lab.experiment('popular', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/popular'
    };

    done();
  });

  lab.test('it responds with popular pages', function (done) {
    pagesServiceStub.getPopular = function () {
      return Promise.resolve([]);
    };

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        'Popular',
        'recent',
        'all-time'
      ]);

      done();
    });
  });

  lab.test('it responds with error', function (done) {
    pagesServiceStub.getPopular = function () {
      return Promise.reject(new Error());
    };

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });
});
