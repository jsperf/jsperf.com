const path = require('path');

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');

const HomePlugin = require('../../../../../server/web/sponsor/index');

const lab = exports.lab = Lab.script();
let request, server;

lab.beforeEach(function (done) {
  const plugins = [ HomePlugin ];
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

lab.experiment('sponsor', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/sponsor'
    };

    done();
  });

  lab.test('it responds with the sponsor page', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        'PayPal',
        'Patreon'
      ]);

      done();
    });
  });
});
