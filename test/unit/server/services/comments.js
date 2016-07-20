'use strict';

const Lab = require('lab');
const Code = require('code');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const commentsRepoStub = {};

const comments = proxyquire('../../../../server/services/comments', {
  '../repositories/comments': commentsRepoStub
});

const lab = exports.lab = Lab.script();

lab.experiment('Comments Service', function () {
  var s;

  lab.beforeEach(function (done) {
    s = sinon.sandbox.create();

    done();
  });

  lab.afterEach(function (done) {
    s.restore();

    done();
  });

  lab.experiment('create', function () {
    var payload;

    lab.beforeEach(function (done) {
      payload = {};

      commentsRepoStub.create = s.stub();

      done();
    });

    lab.test('returns error if comment creation failed', function (done) {
      const testErrMsg = 'testing';
      const testErr = new Error(testErrMsg);

      commentsRepoStub.create.returns(Promise.reject(testErr));

      comments.create(null, null, payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('assigns new id to comment before returning', (done) => {
      const id = 2;
      commentsRepoStub.create.returns(Promise.resolve(id));

      comments.create(null, null, payload)
      .then((comment) => {
        Code.expect(comment).to.include({ id });
        done();
      })
      .catch(done);
    });
  });

  lab.test('delete', (done) => {
    commentsRepoStub.delete = s.stub().returns(Promise.resolve());
    const id = 1;
    comments.delete(id).then(() => {
      Code.expect(commentsRepoStub.delete.calledWith(id)).to.be.true();

      done();
    });
  });
});
