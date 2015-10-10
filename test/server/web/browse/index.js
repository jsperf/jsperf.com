var path = require('path')

var Lab = require('lab')
var Code = require('code')
var Hapi = require('hapi')
var proxyquire = require('proxyquire')

var Config = require('../../../../config')

var pagesRepoStub = {}

var BrowsePlugin = proxyquire('../../../../server/web/browse/index', {
  '../../repositories/pages': pagesRepoStub
})

var lab = exports.lab = Lab.script()
var request, server

lab.beforeEach(function (done) {
  var plugins = [ BrowsePlugin ]
  server = new Hapi.Server()
  server.connection({
    port: Config.get('/port/web')
  })
  server.views({
    engines: {
      hbs: require('handlebars')
    },
    path: './server/web',
    layout: true,
    helpersPath: 'templates/helpers',
    partialsPath: 'templates/partials',
    relativeTo: path.join(__dirname, '..', '..', '..', '..')
  })
  server.register(plugins, done)
})

lab.experiment('browse', function () {
  lab.experiment('page', function () {
    lab.beforeEach(function (done) {
      request = {
        method: 'GET',
        url: '/browse'
      }

      done()
    })

    lab.test('it responds with the browse page', function (done) {
      pagesRepoStub.getLatestVisible = function (cnt, cb) {
        cb(null, [])
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)

        done()
      })
    })

    lab.test('it responds with generic error', function (done) {
      pagesRepoStub.getLatestVisible = function (cnt, cb) {
        cb(new Error())
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)

        done()
      })
    })
  })

  lab.experiment('atom', function () {
    lab.beforeEach(function (done) {
      request = {
        method: 'GET',
        url: '/browse.atom'
      }

      done()
    })

    lab.test('it responds with atom feed', function (done) {
      pagesRepoStub.getLatestVisible = function (cnt, cb) {
        var d = new Date()
        cb(null, [
          {
            updated: d,
            published: d
          }
        ])
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(response.headers['content-type']).to.equal('application/atom+xml;charset=UTF-8')
        Code.expect(response.result).to.be.string().and.to.startWith('<feed').and.to.contain('<entry>')

        done()
      })
    })

    lab.test('it responds with empty atom feed', function (done) {
      pagesRepoStub.getLatestVisible = function (cnt, cb) {
        cb(null, [])
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(response.headers['content-type']).to.equal('application/atom+xml;charset=UTF-8')
        Code.expect(response.result).to.be.string().and.to.startWith('<feed').and.to.not.contain('<entry>')

        done()
      })
    })

    lab.test('it responds with generic error', function (done) {
      pagesRepoStub.getLatestVisible = function (cnt, cb) {
        cb(new Error())
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(500)

        done()
      })
    })
  })

  lab.experiment('author page', function () {
    lab.beforeEach(function (done) {
      request = {
        method: 'GET',
        url: '/browse/test-author'
      }

      done()
    })

    lab.test('it responds with the browse page', function (done) {
      var testTitle = 'My First Test'
      pagesRepoStub.getLatestVisibleForAuthor = function (author, cb) {
        var d = new Date()
        cb(null, [{
          updated: d,
          published: d,
          title: testTitle,
          testCount: 1,
          revision: 1,
          revisionCount: 1
        }])
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(response.result).to.be.string().and.to.contain(testTitle)

        done()
      })
    })

    lab.test('it responds with not found if no results for author', function (done) {
      pagesRepoStub.getLatestVisibleForAuthor = function (autor, cb) {
        cb(null, [])
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(404)

        done()
      })
    })

    lab.test('it responds with generic error', function (done) {
      pagesRepoStub.getLatestVisibleForAuthor = function (author, cb) {
        cb(new Error())
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(500)

        done()
      })
    })
  })

  lab.experiment('author atom', function () {
    lab.beforeEach(function (done) {
      request = {
        method: 'GET',
        url: '/browse/test-author.atom'
      }

      done()
    })

    lab.test('it responds with atom feed', function (done) {
      pagesRepoStub.getLatestVisibleForAuthor = function (author, cb) {
        var d = new Date()
        cb(null, [
          {
            updated: d,
            published: d
          }
        ])
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(response.headers['content-type']).to.equal('application/atom+xml;charset=UTF-8')
        Code.expect(response.result).to.be.string().and.to.startWith('<feed').and.to.contain('<entry>')

        done()
      })
    })

    lab.test('it responds with empty atom feed', function (done) {
      pagesRepoStub.getLatestVisibleForAuthor = function (author, cb) {
        cb(null, [])
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(response.headers['content-type']).to.equal('application/atom+xml;charset=UTF-8')
        Code.expect(response.result).to.be.string().and.to.startWith('<feed').and.to.not.contain('<entry>')

        done()
      })
    })

    lab.test('it responds with generic error', function (done) {
      pagesRepoStub.getLatestVisibleForAuthor = function (author, cb) {
        cb(new Error())
      }

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(500)

        done()
      })
    })
  })
})
