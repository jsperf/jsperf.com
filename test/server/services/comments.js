'use strict';

const Lab = require('lab');
const Code = require('code');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const commentsRepoStub = {};

const comments = proxyquire('../../../server/services/comments', {
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

  lab.experiment('delete', function () {
    lab.beforeEach(function (done) {
      commentsRepoStub.delete = s.stub();

      done();
    });

    lab.test('returns error if comment delete failed', function (done) {
      const testErrMsg = 'testing';
      const testErr = new Error(testErrMsg);

      commentsRepoStub.delete.returns(Promise.reject(testErr));

      comments.delete(1)
        .catch(function (err) {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal(testErrMsg);

          done();
        });
    });
  });
});
