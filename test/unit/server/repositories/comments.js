const Lab = require('lab');
const Code = require('code');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const dbStub = {};

const comments = proxyquire('../../../../server/repositories/comments', {
  '../lib/db': dbStub
});

const lab = exports.lab = Lab.script();

lab.experiment('Comments Repository', () => {
  lab.beforeEach(done => {
    dbStub.genericQuery = sinon.stub();

    done();
  });

  lab.experiment('findByPageID', () => {
    lab.test('selects all from comments where pageID', done => {
      var pageID = 1;
      dbStub.genericQuery.returns(Promise.resolve([]));

      comments.findByPageID(pageID)
      .then(() => {
        Code.expect(
          dbStub.genericQuery.calledWithExactly(
            'SELECT * FROM ?? WHERE pageID = ? ORDER BY published ASC',
            ['comments', pageID]
          )
        ).to.be.true();

        done();
      });
    });
  });

  lab.experiment('create', () => {
    var payload;
    var insertId;

    lab.before(done => {
      payload = {
        pageID: 123
      };

      insertId = 1;

      done();
    });

    lab.test('inserts payload', done => {
      dbStub.genericQuery.returns(Promise.resolve({ insertId: insertId }));

      comments.create(payload)
        .then(newId => {
          Code.expect(
            dbStub.genericQuery.calledWithExactly(
              'INSERT INTO ?? SET ?',
              [
                'comments',
                payload
              ]
            )
          ).to.be.true();
          Code.expect(newId).to.equal(insertId);

          done();
        });
    });

    lab.test('returns an error if query failed', done => {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      comments.create(payload)
        .catch(function (err) {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal(testErrMsg);

          done();
        });
    });
  });
});
