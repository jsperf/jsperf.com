var Lab = require('lab');
var Code = require('code');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var dbStub = {};

var comments = proxyquire('../../../../server/repositories/comments', {
  '../lib/db': dbStub
});

var lab = exports.lab = Lab.script();

lab.experiment('Comments Repository', function () {
  lab.beforeEach(function (done) {
    dbStub.genericQuery = sinon.stub();

    done();
  });

  lab.experiment('findByPageID', function () {
    lab.test('selects all from comments where pageID', function (done) {
      var pageID = 1;
      dbStub.genericQuery.returns(Promise.resolve([]));

      comments.findByPageID(pageID)
      .then(function () {
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
});
