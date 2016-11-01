var Lab = require('lab');
var Code = require('code');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var mysqlStub = {};
let configStubMockGet;
var configStub = {
  get: () => configStubMockGet,
  '@noCallThru': true
};

var db = proxyquire('../../../../server/lib/db', {
  'mysql': mysqlStub,
  '../../config': configStub
});

var lab = exports.lab = Lab.script();

lab.experiment('Database Lib', function () {
  lab.experiment('escape', function () {
    lab.test('exports mysql.escape', function (done) {
      Code.expect(db).to.include('escape');
      Code.expect(db.escape).to.be.a.function();

      done();
    });
  });

  lab.experiment('genericQuery', function () {
    var queryStub;

    lab.before(function (done) {
      mysqlStub.createConnection = function () {
        return {
          query: queryStub,
          escape: function (val) {
            return '`' + val + '`';
          },
          end: function () {}
        };
      };

      done();
    });

    lab.beforeEach(function (done) {
      queryStub = sinon.stub();
      configStubMockGet = false;

      done();
    });

    lab.test('creates a MySQL connection and makes a query', function (done) {
      queryStub.callsArgWith(2, null);
      db.genericQuery('SELECT ?;', [1]).then(done);
    });

    lab.test('rejects promise when query errors', function (done) {
      queryStub.callsArgWith(2, new Error());
      db.genericQuery('SELECT ?;', [1]).catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        done();
      });
    });

    lab.test('values param is optional', function (done) {
      queryStub.callsArgWith(2, null);
      db.genericQuery('SELECT 1;')
      .then(function () {
        Code.expect(queryStub.args[0]).to.have.length(3);
        done();
      });
    });

    lab.test('enables debug for MySQL connection when config debug enabled', function (done) {
      configStubMockGet = true;
      sinon.spy(mysqlStub, 'createConnection');
      queryStub.callsArgWith(2, null);
      db.genericQuery('SELECT 1;')
      .then(function () {
        Code.expect(mysqlStub.createConnection.args[0][0].debug).to.be.array();

        done();
      });
    });
  });
});
