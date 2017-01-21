const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');
const Hoek = require('hoek');

const MockDb = {
  register: (server, options, next) => {
    server.expose('escape', (val) => '`' + val + '`');
    server.expose('genericQuery', function () {});
    next();
  }
};

MockDb.register.attributes = {
  name: 'db'
};

const TestsRepo = require('../../../../server/repositories/tests');

const lab = exports.lab = Lab.script();

lab.experiment('Tests Repository', function () {
  let server, tests, genericQueryStub;

  lab.before((done) => {
    server = new Hapi.Server();

    server.connection();

    server.register([
      MockDb,
      TestsRepo
    ], (err) => {
      if (err) return done(err);

      tests = server.plugins['repositories/tests'];
      done();
    });
  });

  lab.beforeEach(function (done) {
    genericQueryStub = sinon.stub(server.plugins.db, 'genericQuery');

    done();
  });

  lab.afterEach((done) => {
    genericQueryStub.restore();

    done();
  });

  lab.experiment('bulkCreate', function () {
    var pageID;
    var t;

    lab.before(function (done) {
      t = [
        {
          title: 't1',
          defer: 'n',
          code: 'a = 1'
        }, {
          title: 't2',
          defer: 'n',
          code: 'a = 2'
        }
      ];

      pageID = 1;

      done();
    });

    lab.test('inserts multiple values', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: t.length }));

      tests.bulkCreate(pageID, t)
        .then(function () {
          Code.expect(
            genericQueryStub.calledWithExactly(
              'INSERT INTO ?? (??) VALUES (1, `t1`, `n`, `a = 1`), (1, `t2`, `n`, `a = 2`)',
              [
                'tests',
                ['pageID', 'title', 'defer', 'code']
              ]
            )
          ).to.be.true();

          done();
        });
    });

    lab.test('returns an error when not enough rows inserted', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: t.length - 1 }));

      tests.bulkCreate(pageID, t)
        .catch(function (err) {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal('Not all tests inserted');

          done();
        });
    });

    lab.test('returns an error when not enough rows inserted', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      genericQueryStub.returns(Promise.reject(testErr));

      tests.bulkCreate(pageID, t)
        .catch(function (err) {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal(testErrMsg);

          done();
        });
    });
  });

  lab.experiment('bulkUpdate', function () {
    var pageID;
    var t;

    lab.before(function (done) {
      t = [
        {
          title: 't1',
          defer: 'n',
          code: 'a = 1'
        }, {
          title: 't2',
          defer: 'n',
          code: 'a = 2'
        }
      ];

      pageID = 1;

      done();
    });

    lab.test('inserts multiple values', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: 1 }));

      tests.bulkUpdate(pageID, t, false)
        .then(results => {
          let call1 = genericQueryStub.getCall(0).args;
          call1 = Hoek.flatten(call1).join(',');
          let call2 = genericQueryStub.getCall(1).args;
          call2 = Hoek.flatten(call2).join(',');

          Code.expect(call1).to.equal('INSERT INTO ?? (??) VALUES (1, `t1`, `n`, `a = 1`),tests,pageID,title,defer,code');
          Code.expect(call2).to.equal('INSERT INTO ?? (??) VALUES (1, `t2`, `n`, `a = 2`),tests,pageID,title,defer,code');
          done();
        });
    });

    lab.test('returns the result of each update', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: 1 }));

      tests.bulkUpdate(pageID, t, false)
        .then(results => {
          Code.expect(results[0].affectedRows).to.equal(1);
          Code.expect(results[1].affectedRows).to.equal(1);

          done();
        });
    });

    lab.test('updates test if it is an existing test', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: 1 }));
      let tClone = Hoek.clone(t);
      tClone[0].testID = 123;
      tClone[0].pageID = 1;
      tClone[1].testID = 321;
      tClone[1].pageID = 1;
      tests.bulkUpdate(pageID, tClone, false)
        .then(results => {
          let call1 = genericQueryStub.getCall(0).args;
          call1 = Hoek.flatten(call1).join(',');
          let call2 = genericQueryStub.getCall(1).args;
          call2 = Hoek.flatten(call2).join(',');

          Code.expect(call1).to.equal('UPDATE tests SET title = `t1`, defer =  `n` , code =  `a = 1` WHERE pageID = 1 AND testID = 123');
          Code.expect(call2).to.equal('UPDATE tests SET title = `t2`, defer =  `n` , code =  `a = 2` WHERE pageID = 1 AND testID = 321');
          done();
        });
    });

    lab.test('deletes existing test if no title and no code', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: 1 }));
      let tClone = Hoek.clone(t);
      tClone[0].testID = 123;
      tClone[0].pageID = 1;
      tClone[1].testID = 321;
      tClone[1].pageID = 2;
      delete tClone[0].code;
      delete tClone[0].title;
      delete tClone[1].code;
      delete tClone[1].title;

      tests.bulkUpdate(pageID, tClone, true)
        .then(results => {
          let call1 = genericQueryStub.getCall(0).args;
          call1 = Hoek.flatten(call1).join(',');
          let call2 = genericQueryStub.getCall(1).args;
          call2 = Hoek.flatten(call2).join(',');

          Code.expect(call1).to.equal('DELETE FROM tests WHERE pageID = 1 AND testID = 123');
          Code.expect(call2).to.equal('DELETE FROM tests WHERE pageID = 1 AND testID = 321');

          done();
        });
    });

    lab.test('does nothing if no title and no code with no test id', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: 1 }));
      let tClone = Hoek.clone(t);
      delete tClone[0].code;
      delete tClone[0].title;
      delete tClone[1].code;
      delete tClone[1].title;

      tests.bulkUpdate(pageID, tClone, true)
        .then(results => {
          let call1 = genericQueryStub.getCall(0);

          Code.expect(call1).to.equal(null);

          done();
        });
    });

    lab.test('does nothing if no title and no code with no ownership', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: 1 }));
      let tClone = Hoek.clone(t);
      tClone[0].testID = 123;
      tClone[1].testID = 321;
      delete tClone[0].code;
      delete tClone[0].title;
      delete tClone[1].code;
      delete tClone[1].title;

      tests.bulkUpdate(pageID, tClone, false)
        .then(results => {
          let call1 = genericQueryStub.getCall(0);

          Code.expect(call1).to.equal(null);

          done();
        });
    });

    lab.test('returns an error when not enough rows inserted', function (done) {
      genericQueryStub.returns(Promise.resolve({ affectedRows: 0 }));

      tests.bulkUpdate(pageID, t, false)
        .catch(err => {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal('Not all tests inserted');
          done();
        });
    });
  });

  lab.experiment('findByPageID', function () {
    lab.test('selects all from tests where pageID', function (done) {
      var pageID = 1;
      genericQueryStub.returns(Promise.resolve([]));

      tests.findByPageID(pageID)
        .then(function () {
          Code.expect(
            genericQueryStub.calledWithExactly(
              'SELECT * FROM ?? WHERE pageID = ?',
              ['tests', pageID]
            )
          ).to.be.true();

          done();
        });
    });
  });
});
