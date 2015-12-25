const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const Config = require('../../../../config');

const mockDb = { genericQuery: function () {} };

var HealthPlugin = proxyquire('../../../../server/web/health/index', {
  '../../lib/db': mockDb
});

var lab = exports.lab = Lab.script();
var request, server, s;

lab.beforeEach(function (done) {
  s = sinon.sandbox.create();

  server = new Hapi.Server();
  server.connection({
    port: Config.get('/port/web')
  });

  server.register([ HealthPlugin ], done);
});

lab.afterEach(function (done) {
  s.restore();

  done();
});

lab.experiment('health', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/health'
    };

    done();
  });

  lab.test('it responds unhealthy', function (done) {
    s.stub(mockDb, 'genericQuery').returns(Promise.reject());

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });

  lab.test('it responds healthy', function (done) {
    s.stub(mockDb, 'genericQuery').returns(Promise.resolve());

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });
});
