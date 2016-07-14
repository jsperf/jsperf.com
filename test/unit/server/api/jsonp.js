var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var Config = require('../../../../config');

var JsonpPlugin = require('../../../../server/api/jsonp');

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ JsonpPlugin ];
  server = new Hapi.Server();
  server.connection({
    port: Config.get('/port/web')
  });
  server.register(plugins, done);
});

lab.experiment('jsonp', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/api/jsonp'
    };

    done();
  });

  lab.test('it returns object with "content" key and "test" value', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      Code.expect(response.headers['access-control-allow-origin']).to.equal('*');
      Code.expect(response.result.content).to.equal('test');

      done();
    });
  });
});
