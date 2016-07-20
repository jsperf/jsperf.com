var path = require('path');

var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var HomePlugin = require('../../../../../server/web/contributors/index');

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ HomePlugin ];
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

lab.experiment('contributors', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/contributors'
    };

    done();
  });

  lab.test('it responds with the contributors page', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        'Bynens',
        'Benchmark.js',
        'Kieffer',
        'Simon',
        'Browserscope',
        'Dalton'
      ]);

      done();
    });
  });
});
