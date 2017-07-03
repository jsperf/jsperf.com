const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const mysqlStub = {};
const umzugStub = {};

const Db = proxyquire('../../../../../server/lib/db', {
  'mysql': mysqlStub,
  'umzug': function () {
    return umzugStub;
  }
});

const lab = exports.lab = Lab.script();

lab.experiment('Database Plugin', () => {
  lab.test('registers successfully', (done) => {
    umzugStub.up = () => Promise.resolve([]);

    const server = new Hapi.Server();

    server.connection();

    server.register([Db], (err) => {
      Code.expect(err).to.not.exist();
      Code.expect(server.plugins).to.include('db');

      done();
    });
  });

  lab.test('registers UNsuccessfully', (done) => {
    umzugStub.up = () => Promise.reject(new Error('umzugtesting'));

    const server = new Hapi.Server();

    server.connection();

    server.register([Db], (err) => {
      Code.expect(err).to.exist();
      Code.expect(err.message).to.equal('umzugtesting');

      done();
    });
  });

  lab.test('registers debug', (done) => {
    umzugStub.up = () => Promise.resolve([]);

    const server = new Hapi.Server();

    server.connection();

    server.register([{
      register: Db,
      options: { debug: true }
    }], (err) => {
      Code.expect(err).to.not.exist();

      done();
    });
  });

  lab.experiment('escape', function () {
    lab.test('exports mysql.escape', function (done) {
      umzugStub.up = () => Promise.resolve([]);

      const server = new Hapi.Server();

      server.connection();

      server.register([{
        register: Db,
        options: { debug: true }
      }], (err) => {
        Code.expect(err).to.not.exist();
        Code.expect(server.plugins.db).to.include('escape');
        Code.expect(server.plugins.db.escape).to.be.a.function();

        done();
      });
    });
  });

  lab.experiment('genericQuery', function () {
    let queryStub, endStub, server;

    lab.before(function (done) {
      mysqlStub.createConnection = function () {
        return {
          query: queryStub,
          escape: function (val) {
            return '`' + val + '`';
          },
          end: endStub
        };
      };

      server = new Hapi.Server();

      server.connection();

      server.register([Db], done);
    });

    lab.beforeEach(function (done) {
      queryStub = sinon.stub();
      endStub = sinon.stub().callsArgWith(0, null);

      done();
    });

    lab.test('exposes genericQuery', (done) => {
      Code.expect(server.plugins.db).to.include('genericQuery');
      Code.expect(server.plugins.db.genericQuery).to.be.a.function();
      done();
    });

    lab.test('creates a MySQL connection and makes a query', function (done) {
      queryStub.callsArgWith(2, null);
      server.plugins.db.genericQuery('SELECT ?;', [1]).then(done);
    });

    lab.test('rejects promise when query errors', function (done) {
      queryStub.callsArgWith(2, new Error());
      server.plugins.db.genericQuery('SELECT ?;', [1]).catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        done();
      });
    });

    lab.test('values param is optional', function (done) {
      queryStub.callsArgWith(2, null);
      server.plugins.db.genericQuery('SELECT 1;')
        .then(function () {
          Code.expect(queryStub.args[0]).to.have.length(3);
          done();
        });
    });

    lab.test('logs error from ending connection', (done) => {
      queryStub.callsArgWith(2, null);
      endStub.callsArgWith(0, new Error('testend'));
      server.plugins.db.genericQuery('SELECT 1;')
        .then(function () {
          done();
        });
    });
  });
});
