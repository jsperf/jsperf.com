var path = require('path')

var Lab = require('lab')
var sinon = require('sinon')
var Code = require('code')
var Hapi = require('hapi')
var proxyquire = require('proxyquire')

var Config = require('../../../../config')

var pagesServiceStub = {
  updateHits: function (id, cb) {
    if (Number(id) === 999) {
      cb(new Error('TODO'))
    }
    cb(null)
  },
  getBySlug: function () {}
}
var debugSpy = sinon.spy()

var TestPlugin = proxyquire('../../../../server/web/test/index', {
  '../../services/pages': pagesServiceStub,
  'debug': function () { return debugSpy }
})

var YarPlugin = {
  register: require('yar'),
  options: { cookieOptions: { password: 'testing' } }
}

var AuthPlugin = {
  register: require('hapi-auth-cookie'),
  options: {}
}

var lab = exports.lab = Lab.script()
var request, server

lab.beforeEach(function (done) {
  var plugins = [ TestPlugin, YarPlugin ]
  server = new Hapi.Server()

  server.connection({
    port: Config.get('/port/web')
  })

  server.register([ AuthPlugin ], function () {
    server.auth.strategy('session', 'cookie', {
      password: 'testing',
      cookie: 'sid-jsperf',
      redirectTo: false,
      isSecure: false
    })
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

lab.experiment('test', function () {
  const slug = 'oh-yea'

  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/' + slug
    }

    done()
  })

  lab.test('not found', function (done) {
    pagesServiceStub.getBySlug = function (s, r, cb) {
      cb(new Error('Not found'))
    }

    // adding revision to url here covers true case of rev ternary
    request.url += '/999'

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(404)

      done()
    })
  })

  lab.test('fail to get by slug', function (done) {
    pagesServiceStub.getBySlug = function (s, r, cb) {
      cb(new Error('real helpful'))
    }

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500)

      done()
    })
  })

  lab.test('it responds with test page for slug', function (done) {
    const now = new Date()

    pagesServiceStub.getBySlug = function (s, r, cb) {
      cb(null, {
        id: 1,
        slug: slug,
        revision: 1,
        browserscopeID: 'abc123',
        title: 'Oh Yea',
        info: 'Sample test',
        setup: '',
        teardown: '',
        initHTML: '',
        visible: 'y',
        author: 'Max',
        authorEmail: 'm@b.co',
        authorURL: 'b.co',
        hits: 0,
        published: now,
        updated: now
      }, [], [], [])
    }

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })

  lab.test('it responds with highlighted test page for slug', function (done) {
    const now = new Date()

    pagesServiceStub.getBySlug = function (s, r, cb) {
      cb(null, {
        id: 1,
        slug: slug,
        revision: 1,
        browserscopeID: 'abc123',
        title: 'Oh Yea',
        info: 'Sample test',
        setup: 'var a = 1',
        teardown: 'delete a',
        initHTML: '<div class=\'test\'><script>var b = 2;</script></div>',
        visible: 'n',
        author: 'Max',
        authorEmail: 'm@b.co',
        authorURL: 'b.co',
        hits: 0,
        published: now,
        updated: now
      }, [], [], [])
    }

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })

  lab.experiment('Page Hits', function () {
    lab.beforeEach(function (done) {
      // Add a method of adding session data
      server.route({
        method: 'GET', path: '/setsession',
        config: {
          handler: function (req, reply) {
            var hits = {123: true}
            req.session.set('hits', hits)
            return reply('session set')
          }
        }
      })

      done()
    })
    lab.test('updates unique page hits', function (done) {
      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie']
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/)
        request.headers = {}
        request.headers.cookie = 'session=' + cookie[1]
        server.inject(request, function (response) {
          var hits = response.request.session.get('hits')
          Code.expect(hits[1]).to.equal(true)

          done()
        })
      })
    })

    lab.test('ignores duplicate page hits', function (done) {
      const now = new Date()
      pagesServiceStub.getBySlug = function (s, r, cb) {
        cb(null, {
          id: 123,
          slug: slug,
          revision: 1,
          browserscopeID: 'abc123',
          title: 'Oh Yea',
          info: 'Sample test',
          setup: '',
          teardown: '',
          initHTML: '',
          visible: 'y',
          author: 'Max',
          authorEmail: 'm@b.co',
          authorURL: 'b.co',
          hits: 0,
          published: now,
          updated: now
        }, [], [], [])
      }

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie']
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/)
        request.headers = {}
        request.headers.cookie = 'session=' + cookie[1]
        server.inject(request, function (response) {
          var hits = response.request.session.get('hits')
          Code.expect(hits[123]).to.equal(true)

          done()
        })
      })
    })

    lab.test('catches errors from page service', function (done) {
      const now = new Date()
      pagesServiceStub.getBySlug = function (s, r, cb) {
        cb(null, {
          id: 999,
          slug: slug,
          revision: 1,
          browserscopeID: 'abc123',
          title: 'Oh Yea',
          info: 'Sample test',
          setup: '',
          teardown: '',
          initHTML: '',
          visible: 'y',
          author: 'Max',
          authorEmail: 'm@b.co',
          authorURL: 'b.co',
          hits: 0,
          published: now,
          updated: now
        }, [], [], [])
      }

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie']
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/)
        request.headers = {}
        request.headers.cookie = 'session=' + cookie[1]
        server.inject(request, function () {
          const debugCall = debugSpy.getCall(0).args[0]
          const expectedError = new Error('TODO')

          Code.expect(debugCall.message).to.equal(expectedError.message)

          done()
        })
      })
    })
  })

  lab.experiment('No Index Flag', function () {
    lab.beforeEach(function (done) {
      const now = new Date()
      pagesServiceStub.getBySlug = function (s, r, cb) {
        cb(null, {
          id: 1,
          slug: slug,
          revision: 1,
          browserscopeID: 'abc123',
          title: 'Oh Yea',
          info: 'Sample test',
          setup: '',
          teardown: '',
          initHTML: '',
          visible: 'n',
          author: 'Max',
          authorEmail: 'm@b.co',
          authorURL: 'b.co',
          hits: 0,
          published: now,
          updated: now
        }, [], [], [])
      }

      done()
    })

    lab.test('sets noIndex to true if page is flaged as "owned" in the session', function (done) {
      server.route({
        method: 'GET', path: '/setsession',
        config: {
          handler: function (req, reply) {
            var owns = {1: true}
            req.session.set('own', owns)
            return reply('session set')
          }
        }
      })
      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie']
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/)
        request.headers = {}
        request.headers.cookie = 'session=' + cookie[1]
        server.inject(request, function (response) {
          Code.expect(response.payload.indexOf('Not published yet!')).to.be.at.least(0)

          done()
        })
      })
    })

    lab.test('sets noIndex to true if page is being viewed by an admin', function (done) {
      server.route({
        method: 'GET', path: '/setsession',
        config: {
          handler: function (req, reply) {
            var owns = {2: true}
            req.session.set('own', owns)
            req.session.set('admin', true)
            return reply('session set')
          }
        }
      })

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie']
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/)
        request.headers = {}
        request.headers.cookie = 'session=' + cookie[1]
        server.inject(request, function (response) {
          Code.expect(response.payload.indexOf('Not published yet!')).to.be.at.least(0)

          done()
        })
      })
    })
  })
})
