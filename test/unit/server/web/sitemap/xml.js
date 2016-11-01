const path = require('path');

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const SitemapPlugin = require('../../../../../server/web/sitemap/xml');

const MockRepo = {
  register: (server, options, next) => {
    server.expose('getSitemap', function () {});
    next();
  }
};

MockRepo.register.attributes = {
  name: 'repositories/pages'
};

const lab = exports.lab = Lab.script();
let request, server, getSitemapStub;

lab.beforeEach(function (done) {
  const plugins = [ MockRepo, SitemapPlugin ];
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
    server.register(plugins, (err) => {
      if (err) return done(err);

      getSitemapStub = sinon.stub(server.plugins['repositories/pages'], 'getSitemap');
      done();
    });
  });
});

lab.experiment('sitemap', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/sitemap.xml'
    };

    done();
  });

  lab.test('it responds with sitemap XML', function (done) {
    getSitemapStub.returns(Promise.resolve([]));

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        'urlset',
        'url>',
        'loc'
      ]);

      done();
    });
  });

  lab.test('it responds with error', function (done) {
    getSitemapStub.returns(Promise.reject(new Error()));

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });
});
