var path = require('path')

var Lab = require('lab')
var Code = require('code')
var Hapi = require('hapi')
var proxyquire = require('proxyquire')

var Config = require('../../../../config')

var pagesServiceStub = {}

var SearchPlugin = proxyquire('../../../../server/web/search/index', {
  '../../services/pages': pagesServiceStub
})

var lab = exports.lab = Lab.script()
var request, server

lab.beforeEach(function (done) {
  var plugins = [ SearchPlugin ]
  server = new Hapi.Server()
  server.connection({
    port: Config.get('/port/web')
  })
  server.views({
    engines: {
      hbs: require('handlebars')
    },
    path: './server/web',
    relativeTo: path.join(__dirname, '..', '..', '..', '..')
  })
  server.register(plugins, done)
})

lab.experiment('search', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/search'
    }

    done()
  })

  lab.test('it responds with search form', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.include([
        'Search jsPerf',
        '<form'
      ])

      done()
    })
  })

  lab.test('it responds with search form from empty form submission', function (done) {
    request.url += '?q='

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.include([
        'Search jsPerf',
        '<form'
      ])

      done()
    })
  })

  lab.test('it responds with an error from querying', function (done) {
    pagesServiceStub.find = function (q, cb) {
      cb(new Error())
    }

    request.url += '?q=a'

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500)

      done()
    })
  })

  lab.test('it responds with no results from querying', function (done) {
    pagesServiceStub.find = function (q, cb) {
      cb(null, [])
    }

    request.url += '?q=a'

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.include('No results found for query: ')

      done()
    })
  })

  lab.test('it responds with search results', function (done) {
    var currentTime = new Date()
    var testUrl = 'http://example.com'
    var testTitle = 'Test result'
    pagesServiceStub.find = function (searchTerms, cb) {
      cb(null, [{
        url: testUrl,
        revision: 1,
        title: testTitle,
        revisionCount: 1,
        testCount: 1,
        updated: currentTime
      }])
    }

    request.url += '?q=test'

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.include([
        testUrl,
        testTitle,
        currentTime.toISOString()
      ])
      done()
    })
  })

  lab.experiment('atom', function () {
    lab.test('it ignores non-atom extensions', function (done) {
      request.url += '.php'

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(404)
        done()
      })
    })

    lab.test('it responds w/ atom feed', function (done) {
      var currentTime = new Date()
      var testUrl = 'http://example.com'
      var testTitle = 'Test result'
      pagesServiceStub.find = function (searchTerms, cb) {
        cb(null, [{
          url: testUrl,
          revision: 1,
          title: testTitle,
          revisionCount: 1,
          testCount: 1,
          updated: currentTime,
          published: currentTime
        }])
      }

      request.url += '.atom?q=test'

      server.inject(request, function (response) {
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(response.result).to.include([
          '<title>' + testTitle + '</title>'
        ])
        done()
      })
    })
  })
})
