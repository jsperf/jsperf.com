var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var WebRedirectsPlugin = require('../../../../server/web/redirects');

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ WebRedirectsPlugin ];
  server = new Hapi.Server();
  server.connection();
  server.register(plugins, done);
});

lab.experiment('redirects', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET'
    };

    done();
  });

  lab.test('it redirects @ to twitter profile', function (done) {
    request.url = '/@';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(301);
      Code.expect(response.headers.location).to.equal('https://twitter.com/jsperf');

      done();
    });
  });

  lab.test('it redirects aliases to relative URLs', function (done) {
    request.url = '/donate';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(301);
      Code.expect(response.headers.location).to.equal('/sponsor');

      done();
    });
  });
});
