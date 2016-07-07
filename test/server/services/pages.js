'use strict';

var Lab = require('lab');
var Code = require('code');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var pagesRepoStub = {};

var testsRepoStub = {};

var bsRepoStub = {};

var commentsRepoStub = {};

var pages = proxyquire('../../../server/services/pages', {
  '../repositories/pages': pagesRepoStub,
  '../repositories/tests': testsRepoStub,
  '../repositories/browserscope': bsRepoStub,
  '../repositories/comments': commentsRepoStub
});

var lab = exports.lab = Lab.script();

lab.experiment('Pages Service', function () {
  var s;

  lab.beforeEach(function (done) {
    s = sinon.sandbox.create();

    done();
  });

  lab.afterEach(function (done) {
    s.restore();

    done();
  });

  lab.experiment('checkIfSlugAvailable', function () {
    var testSlug;
    var tableStub;
    var serverMock;

    lab.beforeEach(function (done) {
      testSlug = 'test-slug';

      tableStub = s.stub().returns([
        {
          table: [
            {
              path: '/'
            }
          ]
        }
      ]);

      serverMock = {
        table: tableStub
      };

      pagesRepoStub.get = s.stub();

      done();
    });

    lab.test('returns false if slug is reserved', function (done) {
      testSlug = 'reserved';

      tableStub = s.stub().returns([
        {
          table: [
            {
              path: '/' + testSlug
            }
          ]
        }
      ]);

      serverMock = {
        table: tableStub
      };

      pages.checkIfSlugAvailable(serverMock, testSlug)
      .then(function (isAvail) {
        Code.expect(isAvail).to.be.false();
        Code.expect(pagesRepoStub.get.called).to.be.false();

        done();
      });
    });

    lab.test('returns error if getting page fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      pagesRepoStub.get.returns(Promise.reject(testErr));

      pages.checkIfSlugAvailable(serverMock, testSlug)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('returns false if page with slug exists', function (done) {
      pagesRepoStub.get.returns(Promise.resolve({}));

      pages.checkIfSlugAvailable(serverMock, testSlug)
      .then(function (isAvail) {
        Code.expect(isAvail).to.be.false();

        done();
      });
    });

    lab.test('returns true if no app route or page exists for given slug', function (done) {
      pagesRepoStub.get.returns(Promise.resolve(undefined));

      pages.checkIfSlugAvailable(serverMock, testSlug)
      .then(function (isAvail) {
        Code.expect(isAvail).to.be.true();

        done();
      });
    });
  });

  lab.experiment('create', function () {
    var payload;

    lab.beforeEach(function (done) {
      payload = {};

      bsRepoStub.addTest = s.stub();

      pagesRepoStub.create = s.stub();

      testsRepoStub.bulkCreate = s.stub();

      done();
    });

    lab.test('returns error if browserscope fails to add test', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.returns(Promise.reject(testErr));

      pages.create(payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);
        Code.expect(pagesRepoStub.create.called).to.be.false();

        done();
      });
    });

    lab.test('returns error if page fails to create', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.create.returns(Promise.reject(testErr));

      pages.create(payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);
        Code.expect(testsRepoStub.bulkCreate.called).to.be.false();

        done();
      });
    });

    lab.test('returns error if tests fail to create', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.create.returns(Promise.resolve());

      testsRepoStub.bulkCreate.returns(Promise.reject(testErr));

      pages.create(payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('adds browserscope test, page, and tests', function (done) {
      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.create.returns(Promise.resolve());

      testsRepoStub.bulkCreate.returns(Promise.resolve());

      pages.create(payload)
      .then(done);
    });
  });

  lab.experiment('edit', function () {
    var payload;

    lab.beforeEach(function (done) {
      payload = {};

      bsRepoStub.addTest = s.stub();

      pagesRepoStub.create = s.stub();

      pagesRepoStub.updateById = s.stub();

      testsRepoStub.bulkCreate = s.stub();

      testsRepoStub.bulkUpdate = s.stub();

      done();
    });

    lab.test('returns error if browserscope fails to add test', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.returns(Promise.reject(testErr));

      pages.edit(payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);
        Code.expect(pagesRepoStub.create.called).to.be.false();

        done();
      });
    });

    lab.test('returns error if page fails to create', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.create.returns(Promise.reject(testErr));

      pages.edit(payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);
        Code.expect(testsRepoStub.bulkCreate.called).to.be.false();

        done();
      });
    });

    lab.test('returns error if page fails to update', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.updateById.returns(Promise.reject(testErr));

      pages.edit(payload, true)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);
        Code.expect(testsRepoStub.bulkCreate.called).to.be.false();

        done();
      });
    });

    lab.test('returns error if tests fail to update', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.create.returns(Promise.resolve());

      testsRepoStub.bulkUpdate.returns(Promise.reject(testErr));

      pages.edit(payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('adds browserscope test, page, and tests', function (done) {
      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.create.returns(Promise.resolve());

      testsRepoStub.bulkCreate.returns(Promise.resolve());

      pages.edit(payload)
      .then(done);
    });

    lab.test('edits browserscope test, page, and tests', function (done) {
      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.updateById.returns(Promise.resolve());

      testsRepoStub.bulkUpdate.returns(Promise.resolve());

      pages.edit(payload, true)
      .then(done);
    });

    lab.test('edits page by calling pageRepo.updateById', function (done) {
      bsRepoStub.addTest.returns(Promise.resolve());

      pagesRepoStub.updateById.returns(Promise.resolve());

      testsRepoStub.bulkUpdate.returns(Promise.resolve());

      pages.edit({id: 222}, true, 1, 123)
      .then(() => {
        let call1 = pagesRepoStub.updateById.getCall(0).args;
        Code.expect(call1[0].id).to.equal(222);
        Code.expect(call1[1]).to.equal(123);
        done();
      });
    });
  });

  lab.experiment('getPopular', function () {
    lab.beforeEach(function (done) {
      pagesRepoStub.getPopularRecent = s.stub();
      pagesRepoStub.getPopularAllTime = s.stub();

      done();
    });

    lab.test('returns error if getting recent fails', function (done) {
      pagesRepoStub.getPopularRecent.returns(Promise.reject(new Error()));
      pagesRepoStub.getPopularAllTime.returns(Promise.resolve());

      pages.getPopular().then(done)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);

        done();
      });
    });

    lab.test('returns error if getting all-time fails', function (done) {
      pagesRepoStub.getPopularRecent.returns(Promise.resolve([]));
      pagesRepoStub.getPopularAllTime.returns(Promise.reject(new Error()));

      pages.getPopular()
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);

        done();
      });
    });

    lab.test('returns object of recent and all-time pages', function (done) {
      pagesRepoStub.getPopularRecent.returns(Promise.resolve([]));
      pagesRepoStub.getPopularAllTime.returns(Promise.resolve([]));

      pages.getPopular()
      .then(function (results) {
        Code.expect(results).to.be.object();
        Code.expect(results.recent).to.be.array();
        Code.expect(results.allTime).to.be.array();

        done();
      }).catch(done);
    });
  });

  lab.experiment('find', function () {
    lab.beforeEach(function (done) {
      pagesRepoStub.find = s.stub();

      done();
    });

    lab.test('calls through to repo method of same name', function (done) {
      var testRes = [];
      pagesRepoStub.find.returns(Promise.resolve(testRes));

      pages.find('query')
      .then(function (results) {
        Code.expect(results).to.equal(testRes);

        done();
      });
    });
  });

  lab.experiment('updateHits', function () {
    lab.beforeEach(function (done) {
      pagesRepoStub.updateHits = s.stub();

      done();
    });

    lab.test('calls through to repo method of same name', function (done) {
      var pageID = 1;
      pagesRepoStub.updateHits.returns(Promise.resolve());

      pages.updateHits(pageID)
      .then(function () {
        Code.expect(pagesRepoStub.updateHits.calledWith(pageID)).to.be.true();

        done();
      });
    });
  });

  lab.experiment('getBySlug', function () {
    var slug = 'example';
    var rev = 1;

    lab.beforeEach(function (done) {
      pagesRepoStub.getBySlug = s.stub();
      bsRepoStub.addTest = s.stub();
      pagesRepoStub.update = s.stub();
      testsRepoStub.findByPageID = s.stub();
      pagesRepoStub.findBySlug = s.stub();
      commentsRepoStub.findByPageID = s.stub();

      done();
    });

    lab.test('rejects with error from getting page by stub', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);
      pagesRepoStub.getBySlug.returns(Promise.reject(testErr));

      pages.getBySlug(slug, rev)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('rejects with error if page not found', function (done) {
      pagesRepoStub.getBySlug.returns(Promise.resolve([]));

      pages.getBySlug(slug, rev)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal('Not found');

        done();
      });
    });

    lab.test('rejects with error from adding browserscope test', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);
      pagesRepoStub.getBySlug.returns(Promise.resolve([{ id: 1 }]));
      bsRepoStub.addTest.returns(Promise.reject(testErr));

      pages.getBySlug(slug, rev)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('rejects with error from updating browserscopeID of page', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);
      pagesRepoStub.getBySlug.returns(Promise.resolve([{ id: 1 }]));
      bsRepoStub.addTest.returns(Promise.resolve('abc123'));
      pagesRepoStub.update.returns(Promise.reject(testErr));

      pages.getBySlug(slug, rev)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('rejects with error from finding tests', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);
      pagesRepoStub.getBySlug.returns(Promise.resolve([{ id: 1, browserscopeID: 'abc123' }]));
      testsRepoStub.findByPageID.returns(Promise.reject(testErr));

      pages.getBySlug(slug, rev)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('rejects with error from finding other pages', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);
      pagesRepoStub.getBySlug.returns(Promise.resolve([{ id: 1, browserscopeID: 'abc123' }]));
      testsRepoStub.findByPageID.returns(Promise.resolve());
      pagesRepoStub.findBySlug.returns(Promise.reject(testErr));

      pages.getBySlug(slug, rev)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('rejects with error from finding comments', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);
      pagesRepoStub.getBySlug.returns(Promise.resolve([{ id: 1, browserscopeID: 'abc123' }]));
      testsRepoStub.findByPageID.returns(Promise.resolve());
      pagesRepoStub.findBySlug.returns(Promise.resolve());
      commentsRepoStub.findByPageID.returns(Promise.reject(testErr));

      pages.getBySlug(slug, rev)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('resolves with page, tests, revisions, and comments', function (done) {
      const mockTests = [];
      const mockPages = [];
      const mockComments = [];
      pagesRepoStub.getBySlug.returns(Promise.resolve([{ id: 1, browserscopeID: 'abc123' }]));
      testsRepoStub.findByPageID.returns(Promise.resolve(mockTests));
      pagesRepoStub.findBySlug.returns(Promise.resolve(mockPages));
      commentsRepoStub.findByPageID.returns(Promise.resolve(mockComments));

      pages.getBySlug(slug, rev)
      .then(function (values) {
        Code.expect(values[0].id).to.equal(1);
        Code.expect(values[1]).to.equal(mockTests);
        Code.expect(values[2]).to.equal(mockPages);
        Code.expect(values[3]).to.equal(mockComments);

        done();
      });
    });

    lab.test('resolves with updated page after adding browserscopeID', function (done) {
      const newBsKey = 'abc123';
      pagesRepoStub.getBySlug.returns(Promise.resolve([{ id: 1, revision: 2 }]));
      bsRepoStub.addTest.returns(Promise.resolve(newBsKey));
      pagesRepoStub.update.returns(Promise.resolve());
      testsRepoStub.findByPageID.returns(Promise.resolve([]));
      pagesRepoStub.findBySlug.returns(Promise.resolve([]));
      commentsRepoStub.findByPageID.returns(Promise.resolve([]));

      pages.getBySlug(slug, rev)
      .then(function (values) {
        Code.expect(values[0].browserscopeID).to.equal(newBsKey);

        done();
      });
    });
  });

  lab.experiment('getVisibleBySlugWithRevisions', () => {
    const slug = 'example';
    const rev = 1;

    lab.beforeEach(done => {
      pagesRepoStub.getVisibleBySlug = s.stub();
      pagesRepoStub.findVisibleBySlug = s.stub();

      done();
    });

    lab.test('rejects with error from getting page by stub', done => {
      const testErrMsg = 'testing';
      const testErr = new Error(testErrMsg);
      pagesRepoStub.getVisibleBySlug.returns(Promise.reject(testErr));

      pages.getVisibleBySlugWithRevisions(slug)
        .catch(err => {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal(testErrMsg);

          done();
        });
    });

    lab.test('rejects with error if page not found', done => {
      pagesRepoStub.getVisibleBySlug.returns(Promise.resolve([]));

      pages.getVisibleBySlugWithRevisions(slug, rev)
        .catch(err => {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal('Not found');

          done();
        });
    });

    lab.test('rejects with error from finding revisions', done => {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);
      pagesRepoStub.getVisibleBySlug.returns(Promise.resolve([{ id: 1, browserscopeID: 'abc123' }]));
      pagesRepoStub.findVisibleBySlug.returns(Promise.reject(testErr));

      pages.getVisibleBySlugWithRevisions(slug, rev)
        .catch(err => {
          Code.expect(err).to.be.instanceof(Error);
          Code.expect(err.message).to.equal(testErrMsg);

          done();
        });
    });

    lab.test('resolves with page and revisions', done => {
      const mockPages = [];
      pagesRepoStub.getVisibleBySlug.returns(Promise.resolve([{ id: 1, browserscopeID: 'abc123' }]));
      pagesRepoStub.findVisibleBySlug.returns(Promise.resolve(mockPages));

      pages.getVisibleBySlugWithRevisions(slug, rev)
        .then(values => {
          Code.expect(values[0].id).to.equal(1);
          Code.expect(values[1]).to.equal(mockPages);

          done();
        });
    });
  });

  lab.experiment('publish', () => {
    lab.test('updates page to be visible', (done) => {
      pagesRepoStub.updateById = s.stub().returns(Promise.resolve());

      pages.publish(1)
        .then(() => {
          Code.expect(pagesRepoStub.updateById.args[0][0]).to.include({
            visible: 'y'
          });
          Code.expect(pagesRepoStub.updateById.args[0][1]).to.equal(1);

          done();
        })
        .catch(done);
    });
  });
});
