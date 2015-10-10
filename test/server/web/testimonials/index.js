var path = require('path')

var Lab = require('lab')
var Code = require('code')
var Hapi = require('hapi')

var Config = require('../../../../config')

var HomePlugin = require('../../../../server/web/testimonials/index')

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

lab.experiment('testimonials', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/testimonials'
    }

    done()
  })

  lab.test('it responds with the testimonials page', function (done) {
    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.include([
        'biggest',
        'second',
        'waste',
        'personal',
        'worse',
        'U',
        'allowed'
      ])

      done()
    })
  })
})
