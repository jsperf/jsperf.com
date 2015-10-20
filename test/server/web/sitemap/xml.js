var path = require('path');

var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');
var proxyquire = require('proxyquire');

var Config = require('../../../../config');

var pagesRepoStub = {};

var SitemapPlugin = proxyquire('../../../../server/web/sitemap/xml', {
  '../../repositories/pages': pagesRepoStub
});

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ SitemapPlugin ];
  server = new Hapi.Server();
  server.connection({
    port: Config.get('/port/web')
  });
  server.views({
    engines: {
      hbs: require('handlebars')
    },
    path: './server/web',
    relativeTo: path.join(__dirname, '..', '..', '..', '..')
  });
  server.register(plugins, done);
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
    pagesRepoStub.getSitemap = function () {
      return Promise.resolve([]);
    };

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
    pagesRepoStub.getSitemap = function () {
      return Promise.reject(new Error());
    };

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });
});
