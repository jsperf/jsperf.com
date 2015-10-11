var path = require('path');

var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var Config = require('../../../../config');

var HomePlugin = require('../../../../server/web/faq/index');

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ HomePlugin ];
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

lab.experiment('faq', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/faq'
    };

    done();
  });

  lab.test('it responds with the faq page', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        'what',
        'engine',
        'script-warnings',
        'firebug-warning',
        'calibration',
        'java-applet',
        'ie9-java',
        'lion-java',
        'chrome',
        'run-single-test',
        'browserscope',
        'autorun',
        'chart-types',
        'result-filters',
        'setup-teardown',
        'async',
        'add-edit',
        'remove-snippet',
        'test-case-feed',
        'author-feed',
        'results-json',
        'test-availability',
        'additional-features'
      ]);

      done();
    });
  });
});
