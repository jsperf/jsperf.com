exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/api/jsonp',
    handler: function (request, reply) {
      reply({ content: 'test' }).header('Access-Control-Allow-Origin', '*')
    }
  })

  return next()
}

exports.register.attributes = {
  name: 'api/jsonp'
}
