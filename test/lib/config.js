var Lab = require('lab')
var Code = require('code')
var Config = require('../../lib/config')

var lab = exports.lab = Lab.script()

lab.experiment('Config', function () {
  lab.experiment('normalizeDomain', function () {
    // each of these tests reloads the module to test env vars during initialization
    var oD, oP, oS, oE

    lab.beforeEach(function (done) {
      oD = process.env.DOMAIN
      oP = process.env.PORT
      oS = process.env.SCHEME
      oE = process.env.NODE_ENV

      done()
    })

    lab.afterEach(function (done) {
      process.env.DOMAIN = oD
      process.env.PORT = oP
      process.env.SCHEME = oS
      process.env.NODE_ENV = oE

      done()
    })

    lab.test('adds port to domain if not already included and not default scheme and port', function (done) {
      // enumerate scenarios for conditional block
      [
        {domain: 'localhost', port: '443', scheme: 'https', expect: 'localhost'},
        {domain: 'localhost', port: '3000', scheme: 'https', expect: 'localhost:3000'},
        {domain: 'localhost', port: '80', scheme: 'http', expect: 'localhost'},
        {domain: 'localhost', port: '3000', scheme: 'http', expect: 'localhost:3000'},
        {domain: 'localhost:1234', port: '3000', scheme: 'http', expect: 'localhost:1234'},
        {domain: 'localhost', port: '443', scheme: 'https', expect: 'localhost', env: 'production'}
      ].forEach(function (test) {
        process.env.DOMAIN = test.domain
        process.env.PORT = test.port
        process.env.SCHEME = test.scheme
        process.env.NODE_ENV = test.env || oE

        Config.normalizeDomain()

        Code.expect(process.env.DOMAIN).to.equal(test.expect)
      })

      done()
    })
  })
})
