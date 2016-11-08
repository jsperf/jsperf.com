const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const HealthPlugin = require('../../../../../server/web/health/index');

const lab = exports.lab = Lab.script();
var request, server, s;

const genericQueryStub = sinon.stub();
const MockDb = {
  register: (server, options, next) => {
    server.expose('genericQuery', genericQueryStub);
    next();
  }
};

MockDb.register.attributes = {
  name: 'db'
};

lab.beforeEach(function (done) {
  s = sinon.sandbox.create();

  server = new Hapi.Server();
  server.connection();

  server.register([
    MockDb,
    HealthPlugin
  ], done);
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
    genericQueryStub.returns(Promise.reject(new Error()));

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });

  lab.test('it responds healthy', function (done) {
    genericQueryStub.returns(Promise.resolve());

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });
});
