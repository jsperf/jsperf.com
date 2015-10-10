var Lab = require('lab')
var Code = require('code')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var dbStub = {
  escape: function (val) {
    return '`' + val + '`'
  }
}

var tests = proxyquire('../../../server/repositories/tests', {
  '../lib/db': dbStub
})

var lab = exports.lab = Lab.script()

lab.experiment('Tests Repository', function () {
  lab.beforeEach(function (done) {
    dbStub.genericQuery = sinon.stub()

    done()
  })

  lab.experiment('bulkCreate', function () {
    var pageID
    var t

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
      ]

      pageID = 1

      done()
    })

    lab.test('inserts multiple values', function (done) {
      dbStub.genericQuery.callsArgWith(2, null, { affectedRows: t.length })

      tests.bulkCreate(pageID, t, function (err) {
        Code.expect(err).to.be.null()
        Code.expect(
          dbStub.genericQuery.calledWithExactly(
            'INSERT INTO ?? (??) VALUES (1, `t1`, `n`, `a = 1`), (1, `t2`, `n`, `a = 2`)',
            [
              'tests',
              ['pageID', 'title', 'defer', 'code']
            ],
            sinon.match.func
          )
        ).to.be.true()

        done()
      })
    })

    lab.test('returns an error when not enough rows inserted', function (done) {
      dbStub.genericQuery.callsArgWith(2, null, { affectedRows: t.length - 1 })

      tests.bulkCreate(pageID, t, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal('Not all tests inserted')

        done()
      })
    })

    lab.test('returns an error when not enough rows inserted', function (done) {
      var testErrMsg = 'testing'
      var testErr = new Error(testErrMsg)

      dbStub.genericQuery.callsArgWith(2, testErr)

      tests.bulkCreate(pageID, t, function (err) {
        Code.expect(err).to.be.instanceof(Error)
        Code.expect(err.message).to.equal(testErrMsg)

        done()
      })
    })
  })

  lab.experiment('findByPageID', function () {
    lab.test('selects all from tests where pageID', function (done) {
      var pageID = 1
      dbStub.genericQuery.callsArgWith(2, null, [])

      tests.findByPageID(pageID, function (err) {
        Code.expect(err).to.be.null()
        Code.expect(
          dbStub.genericQuery.calledWithExactly(
            'SELECT * FROM ?? WHERE pageID = ?',
            ['tests', pageID],
            sinon.match.func
          )
        ).to.be.true()

        done()
      })
    })
  })
})
