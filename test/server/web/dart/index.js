var path = require('path')

var Lab = require('lab')
var Code = require('code')
var Hapi = require('hapi')

var Config = require('../../../../config')

var HomePlugin = require('../../../../server/web/dart/index')

var lab = exports.lab = Lab.script()
var request, server

lab.beforeEach(function (done) {
  var plugins = [ HomePlugin ]
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

lab.experiment('dart', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/dart'
    }

    done()
  })

  lab.test('it responds with the dart page', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.include([
        'November',
        'publically',
        'Dash',
        'Dart',
        'Lars',
        // 'Abrams',
        'Eich',
        'Russell'
      ])

      done()
    })
  })
})
