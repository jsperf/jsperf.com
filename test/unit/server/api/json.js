var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var JsonPlugin = require('../../../../server/api/json');

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ JsonPlugin ];
  server = new Hapi.Server();
  server.connection();
  server.register(plugins, done);
});

lab.experiment('json', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/api/json'
    };

    done();
  });

  lab.test('it returns object with "content" key and "test" value', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      Code.expect(response.result.content).to.equal('test');

      done();
    });
  });
});
