var Lab = require('lab')
var Code = require('code')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var pagesRepoStub = {}

var testsRepoStub = {}

var bsRepoStub = {}

var commentsRepoStub = {}

var pages = proxyquire('../../../server/services/pages', {
  '../repositories/pages': pagesRepoStub,
  '../repositories/tests': testsRepoStub,
  '../repositories/browserscope': bsRepoStub,
  '../repositories/comments': commentsRepoStub
})

var lab = exports.lab = Lab.script()

lab.experiment('Pages Service', function () {
  var s

  lab.beforeEach(function (done) {
    s = sinon.sandbox.create()

    done()
  })

  lab.afterEach(function (done) {
    s.restore()

    done()
  })

  lab.experiment('checkIfSlugAvailable', function () {
    var testSlug
    var tableStub
    var serverMock

    lab.beforeEach(function (done) {
      testSlug = 'test-slug'

      tableStub = s.stub().returns([
        {
          table: [
            {
              path: '/'
            }
          ]
        }
      ])

      serverMock = {
        table: tableStub
      }

      pagesRepoStub.get = s.stub()

      done()
    })

    lab.test('returns false if slug is reserved', function (done) {
      testSlug = 'reserved'

      tableStub = s.stub().returns([
        {
          table: [
            {
              path: '/' + testSlug
            }
          ]
        }
      ])

      serverMock = {
        table: tableStub
      }

      pages.checkIfSlugAvailable(serverMock, testSlug, function (err, isAvail) {
        Code.expect(err).to.be.null()
        Code.expect(isAvail).to.be.false()
        Code.expect(pagesRepoStub.get.called).to.be.false()

        done()
      })
    })

    lab.test('returns error if getting page fails', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)

      pagesRepoStub.get.callsArgWith(2, testErr)

      pages.checkIfSlugAvailable(serverMock, testSlug, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('returns false if page with slug exists', function (done) {
      pagesRepoStub.get.callsArgWith(2, null, {})

      pages.checkIfSlugAvailable(serverMock, testSlug, function (err, isAvail) {
        Code.expect(err).to.be.null()
        Code.expect(isAvail).to.be.false()

        done()
      })
    })

    lab.test('returns true if no app route or page exists for given slug', function (done) {
      pagesRepoStub.get.callsArgWith(2, null, undefined)

      pages.checkIfSlugAvailable(serverMock, testSlug, function (err, isAvail) {
        Code.expect(err).to.be.null()
        Code.expect(isAvail).to.be.true()

        done()
      })
    })
  })

  lab.experiment('create', function () {
    var payload

    lab.beforeEach(function (done) {
      payload = {}

      bsRepoStub.addTest = s.stub()

      pagesRepoStub.create = s.stub()

      testsRepoStub.bulkCreate = s.stub()

      done()
    })

    lab.test('returns error if browserscope fails to add test', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)

      bsRepoStub.addTest.callsArgWith(3, testErr)

      pages.create(payload, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)
        Code.expect(pagesRepoStub.create.called).to.be.false()

        done()
      })
    })

    lab.test('returns error if page fails to create', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)

      bsRepoStub.addTest.callsArgWith(3, null)

      pagesRepoStub.create.callsArgWith(1, testErr)

      pages.create(payload, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)
        Code.expect(testsRepoStub.bulkCreate.called).to.be.false()

        done()
      })
    })

    lab.test('returns error if tests fail to create', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)

      bsRepoStub.addTest.callsArgWith(3, null)

      pagesRepoStub.create.callsArgWith(1, null)

      testsRepoStub.bulkCreate.callsArgWith(2, testErr)

      pages.create(payload, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('adds browserscope test, page, and tests', function (done) {
      bsRepoStub.addTest.callsArgWith(3, null)

      pagesRepoStub.create.callsArgWith(1, null)

      testsRepoStub.bulkCreate.callsArgWith(2, null)

      pages.create(payload, function (err) {
        Code.expect(err).to.be.null()

        done()
      })
    })
  })

  lab.experiment('getPopular', function () {
    lab.beforeEach(function (done) {
      pagesRepoStub.getPopularRecent = s.stub()
      pagesRepoStub.getPopularAllTime = s.stub()

      done()
    })

    lab.test('returns error if getting recent fails', function (done) {
      pagesRepoStub.getPopularRecent.callsArgWith(0, new Error())

      pages.getPopular(function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(pagesRepoStub.getPopularAllTime.called).to.be.false()

        done()
      })
    })

    lab.test('returns error if getting all-time fails', function (done) {
      pagesRepoStub.getPopularRecent.callsArgWith(0, null, [])
      pagesRepoStub.getPopularAllTime.callsArgWith(0, new Error())

      pages.getPopular(function (err) {
        Code.expect(err).to.be.instanceof(Error)

        done()
      })
    })

    lab.test('returns object of recent and all-time pages', function (done) {
      pagesRepoStub.getPopularRecent.callsArgWith(0, null, [])
      pagesRepoStub.getPopularAllTime.callsArgWith(0, null, [])

      pages.getPopular(function (err, results) {
        Code.expect(err).to.be.null()
        Code.expect(results).to.be.object()
        Code.expect(results.recent).to.be.array()
        Code.expect(results.allTime).to.be.array()

        done()
      })
    })
  })

  lab.experiment('find', function () {
    lab.beforeEach(function (done) {
      pagesRepoStub.find = s.stub()

      done()
    })

    lab.test('calls through to repo method of same name', function (done) {
      var testErr = null
      var testRes = []
      pagesRepoStub.find.callsArgWith(1, testErr, testRes)

      pages.find('query', function (err, results) {
        Code.expect(err).to.equal(testErr)
        Code.expect(results).to.equal(testRes)

        done()
      })
    })
  })

  lab.experiment('updateHits', function () {
    lab.beforeEach(function (done) {
      pagesRepoStub.updateHits = s.stub()

      done()
    })

    lab.test('calls through to repo method of same name', function (done) {
      var pageID = 1
      pagesRepoStub.updateHits.callsArgWith(1, null)

      pages.updateHits(pageID, function (err) {
        Code.expect(err).to.be.null()
        Code.expect(pagesRepoStub.updateHits.calledWith(pageID)).to.be.true()

        done()
      })
    })
  })

  lab.experiment('getBySlug', function () {
    var slug = 'example'
    var rev = 1

    lab.beforeEach(function (done) {
      pagesRepoStub.getBySlug = s.stub()
      bsRepoStub.addTest = s.stub()
      pagesRepoStub.update = s.stub()
      testsRepoStub.findByPageID = s.stub()
      pagesRepoStub.findBySlug = s.stub()
      commentsRepoStub.findByPageID = s.stub()

      done()
    })

    lab.test('calls back with error from getting page by stub', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)
      pagesRepoStub.getBySlug.callsArgWith(2, testErr)

      pages.getBySlug(slug, rev, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('calls back with error if page not found', function (done) {
      pagesRepoStub.getBySlug.callsArgWith(2, null, [])

      pages.getBySlug(slug, rev, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal('Not found')

        done()
      })
    })

    lab.test('calls back with error from adding browserscope test', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)
      pagesRepoStub.getBySlug.callsArgWith(2, null, [{ id: 1 }])
      bsRepoStub.addTest.callsArgWith(3, testErr)

      pages.getBySlug(slug, rev, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('calls back with error from updating browserscopeID of page', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)
      pagesRepoStub.getBySlug.callsArgWith(2, null, [{ id: 1 }])
      bsRepoStub.addTest.callsArgWith(3, null, 'abc123')
      pagesRepoStub.update.callsArgWith(2, testErr)

      pages.getBySlug(slug, rev, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('calls back with error from finding tests', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)
      pagesRepoStub.getBySlug.callsArgWith(2, null, [{ id: 1, browserscopeID: 'abc123' }])
      testsRepoStub.findByPageID.callsArgWith(1, testErr)

      pages.getBySlug(slug, rev, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('calls back with error from finding other pages', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)
      pagesRepoStub.getBySlug.callsArgWith(2, null, [{ id: 1, browserscopeID: 'abc123' }])
      testsRepoStub.findByPageID.callsArgWith(1, null)
      pagesRepoStub.findBySlug.callsArgWith(1, testErr)

      pages.getBySlug(slug, rev, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('calls back with error from finding comments', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)
      pagesRepoStub.getBySlug.callsArgWith(2, null, [{ id: 1, browserscopeID: 'abc123' }])
      testsRepoStub.findByPageID.callsArgWith(1, null)
      pagesRepoStub.findBySlug.callsArgWith(1, null)
      commentsRepoStub.findByPageID.callsArgWith(1, testErr)

      pages.getBySlug(slug, rev, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })

    lab.test('calls back with page, tests, revisions, and comments', function (done) {
      const mockTests = []
      const mockPages = []
      const mockComments = []
      pagesRepoStub.getBySlug.callsArgWith(2, null, [{ id: 1, browserscopeID: 'abc123' }])
      testsRepoStub.findByPageID.callsArgWith(1, null, mockTests)
      pagesRepoStub.findBySlug.callsArgWith(1, null, mockPages)
      commentsRepoStub.findByPageID.callsArgWith(1, null, mockComments)

      pages.getBySlug(slug, rev, function (err, page, tests, revisions, comments) {
        Code.expect(err).to.be.null()
        Code.expect(page.id).to.equal(1)
        Code.expect(tests).to.equal(mockTests)
        Code.expect(revisions).to.equal(mockPages)
        Code.expect(comments).to.equal(mockComments)

        done()
      })
    })

    lab.test('calls back with updated page after adding browserscopeID', function (done) {
      const newBsKey = 'abc123'
      pagesRepoStub.getBySlug.callsArgWith(2, null, [{ id: 1, revision: 2 }])
      bsRepoStub.addTest.callsArgWith(3, null, newBsKey)
      pagesRepoStub.update.callsArgWith(2, null)
      testsRepoStub.findByPageID.callsArgWith(1, null, [])
      pagesRepoStub.findBySlug.callsArgWith(1, null, [])
      commentsRepoStub.findByPageID.callsArgWith(1, null, [])

      pages.getBySlug(slug, rev, function (err, page) {
        Code.expect(err).to.be.null()
        Code.expect(page.browserscopeID).to.equal(newBsKey)

        done()
      })
    })
  })
})
