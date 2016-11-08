const path = require('path');
const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const PopularPlugin = require('../../../../../server/web/popular/index');

const MockPagesService = {
  register: (server, options, next) => {
    server.expose('getPopular', function () {});
    next();
  }
};

MockPagesService.register.attributes = {
  name: 'services/pages'
};

const lab = exports.lab = Lab.script();
var request, server, pagesServiceStub;

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
      PopularPlugin
    ], (err) => {
      if (err) return done(err);

      pagesServiceStub = {
        getPopular: sinon.stub(server.plugins['services/pages'], 'getPopular')
      };

      done();
    });
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
    pagesServiceStub.getPopular.returns(Promise.resolve([]));

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
    server.plugins['services/pages'].getPopular = function () {
      return Promise.reject(new Error());
    };

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });
});
