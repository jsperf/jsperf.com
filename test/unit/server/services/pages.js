const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const sinon = require('sinon');

const Pages = require('../../../../server/services/pages');

const MockPagesRepo = {
  register: (server, options, next) => {
    server.expose('get', function () {});
    server.expose('create', function () {});
    server.expose('updateById', function () {});
    server.expose('getPopularRecent', function () {});
    server.expose('getPopularAllTime', function () {});
    server.expose('find', function () {});
    server.expose('updateHits', function () {});
    server.expose('getBySlug', function () {});
    server.expose('update', function () {});
    server.expose('findBySlug', function () {});
    server.expose('getVisibleBySlug', function () {});
    server.expose('findVisibleBySlug', function () {});
    server.expose('deleteOneRevisionBySlug', function () {});
    server.expose('deleteAllRevisionsBySlug', function () {});

    next();
  }
};

MockPagesRepo.register.attributes = {
  name: 'repositories/pages'
};

const MockBsRepo = {
  register: (server, options, next) => {
    server.expose('addTest', function () {});
    next();
  }
};

MockBsRepo.register.attributes = {
  name: 'repositories/browserscope'
};

const MockTestsRepo = {
  register: (server, options, next) => {
    server.expose('bulkCreate', function () {});
    server.expose('bulkUpdate', function () {});
    server.expose('findByPageID', function () {});
    next();
  }
};

MockTestsRepo.register.attributes = {
  name: 'repositories/tests'
};

const MockCommentsRepo = {
  register: (server, options, next) => {
    server.expose('findByPageID', function () {});
    next();
  }
};

MockCommentsRepo.register.attributes = {
  name: 'repositories/comments'
};

const lab = exports.lab = Lab.script();

lab.experiment('Pages Service', function () {
  let s, server, pages, pagesRepoStub, bsRepoStub, testsRepoStub, commentsRepoStub;

  lab.beforeEach(function (done) {
    s = sinon.sandbox.create();

    server = new Hapi.Server();

    server.connection();

    server.register([
      MockPagesRepo,
      MockBsRepo,
      MockTestsRepo,
      MockCommentsRepo,
      Pages
    ], (err) => {
      if (err) return done(err);

      pages = server.plugins['services/pages'];

      pagesRepoStub = {
        get: s.stub(server.plugins['repositories/pages'], 'get'),
        create: s.stub(server.plugins['repositories/pages'], 'create'),
        updateById: s.stub(server.plugins['repositories/pages'], 'updateById'),
        getPopularRecent: s.stub(server.plugins['repositories/pages'], 'getPopularRecent'),
        getPopularAllTime: s.stub(server.plugins['repositories/pages'], 'getPopularAllTime'),
        find: s.stub(server.plugins['repositories/pages'], 'find'),
        updateHits: s.stub(server.plugins['repositories/pages'], 'updateHits'),
        getBySlug: s.stub(server.plugins['repositories/pages'], 'getBySlug'),
        update: s.stub(server.plugins['repositories/pages'], 'update'),
        findBySlug: s.stub(server.plugins['repositories/pages'], 'findBySlug'),
        getVisibleBySlug: s.stub(server.plugins['repositories/pages'], 'getVisibleBySlug'),
        findVisibleBySlug: s.stub(server.plugins['repositories/pages'], 'findVisibleBySlug'),
        deleteOneRevisionBySlug: s.stub(server.plugins['repositories/pages'], 'deleteOneRevisionBySlug'),
        deleteAllRevisionsBySlug: s.stub(server.plugins['repositories/pages'], 'deleteAllRevisionsBySlug')
      };

      bsRepoStub = {
        addTest: s.stub(server.plugins['repositories/browserscope'], 'addTest')
      };

      testsRepoStub = {
        bulkCreate: s.stub(server.plugins['repositories/tests'], 'bulkCreate'),
        bulkUpdate: s.stub(server.plugins['repositories/tests'], 'bulkUpdate'),
        findByPageID: s.stub(server.plugins['repositories/tests'], 'findByPageID')
      };

      commentsRepoStub = {
        findByPageID: s.stub(server.plugins['repositories/comments'], 'findByPageID')
      };

      done();
    });
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

  lab.experiment('deleting', () => {
    lab.test('revision 1 deletes all revisions', (done) => {
      pagesRepoStub.deleteAllRevisionsBySlug.returns(Promise.resolve(3));

      pages.deleteBySlug('oh-yea', 1)
        .then(values => {
          Code.expect(values).to.equal(3);

          done();
        })
        .catch(done);
    });

    lab.test('revisions above 1 deletes just one revision', (done) => {
      pagesRepoStub.deleteOneRevisionBySlug.returns(Promise.resolve(1));

      pages.deleteBySlug('oh-yea', 2)
        .then(values => {
          Code.expect(values).to.equal(1);

          done();
        })
        .catch(done);
    });
  });

  lab.experiment('publish', () => {
    lab.test('updates page to be visible', (done) => {
      pagesRepoStub.updateById.returns(Promise.resolve());

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
