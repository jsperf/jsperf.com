const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const Comments = require('../../../../server/services/comments');

const MockRepo = {
  register: (server, options, next) => {
    server.expose('create', function () {});
    server.expose('delete', function () {});
    next();
  }
};

MockRepo.register.attributes = {
  name: 'repositories/comments'
};

const lab = exports.lab = Lab.script();

lab.experiment('Comments Service', function () {
  var s, server, comments, createStub;

  lab.beforeEach(function (done) {
    s = sinon.sandbox.create();

    server = new Hapi.Server();

    server.connection();

    server.register([
      MockRepo,
      Comments
    ], (err) => {
      if (err) return done(err);

      createStub = s.stub(server.plugins['repositories/comments'], 'create');
      s.stub(server.plugins['repositories/comments'], 'delete');

      comments = server.plugins['services/comments'];

      done();
    });
  });

  lab.afterEach(function (done) {
    s.restore();

    done();
  });

  lab.experiment('create', function () {
    let payload;

    lab.beforeEach(function (done) {
      payload = {};

      done();
    });

    lab.test('returns error if comment creation failed', function (done) {
      const testErrMsg = 'testing';
      const testErr = new Error(testErrMsg);

      createStub.returns(Promise.reject(testErr));

      comments.create(null, null, payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('assigns new id to comment before returning', (done) => {
      const id = 2;
      createStub.returns(Promise.resolve(id));

      comments.create(null, null, payload)
      .then((comment) => {
        Code.expect(comment).to.include({ id });
        done();
      })
      .catch(done);
    });
  });

  lab.test('delete', (done) => {
    const delStub = server.plugins['repositories/comments'].delete;
    delStub.returns(Promise.resolve());
    const id = 1;
    comments.delete(id).then(() => {
      Code.expect(delStub.calledWith(id)).to.be.true();

      done();
    });
  });
});
