const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const Comments = require('../../../../server/repositories/comments');

const MockDb = {
  register: (server, options, next) => {
    server.expose('genericQuery', function () {});
    next();
  }
};

MockDb.register.attributes = {
  name: 'db'
};

const lab = exports.lab = Lab.script();

lab.experiment('Comments Repository', () => {
  let server, comments, genericQueryStub;

  lab.before((done) => {
    server = new Hapi.Server();

    server.connection();

    server.register([
      MockDb,
      Comments
    ], (err) => {
      if (err) return done(err);

      comments = server.plugins['repositories/comments'];
      done();
    });
  });

  lab.beforeEach((done) => {
    genericQueryStub = sinon.stub(server.plugins.db, 'genericQuery');

    done();
  });

  lab.afterEach((done) => {
    genericQueryStub.restore();

    done();
  });

  lab.experiment('findByPageID', () => {
    lab.test('selects all from comments where pageID', done => {
      var pageID = 1;
      genericQueryStub.returns(Promise.resolve([]));

      comments.findByPageID(pageID)
      .then(() => {
        Code.expect(
          genericQueryStub.calledWithExactly(
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
      genericQueryStub.returns(Promise.resolve({ insertId: insertId }));

      comments.create(payload)
        .then(newId => {
          Code.expect(
            genericQueryStub.calledWithExactly(
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

      genericQueryStub.returns(Promise.reject(testErr));

      comments.create(payload)
        .catch(function (err) {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal(testErrMsg);

          done();
        });
    });
  });

  lab.experiment('delete', () => {
    lab.test('should delete specific comment', (done) => {
      genericQueryStub.returns(Promise.resolve());
      const id = 1;
      comments.delete(id).then(() => {
        Code.expect(genericQueryStub.calledWithExactly(
          'DELETE FROM ?? WHERE id = ?',
          ['comments', id]
        )).to.be.true();

        done();
      })
      .catch(done);
    });
  });
});
