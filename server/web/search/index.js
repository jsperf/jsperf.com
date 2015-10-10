var Boom = require('boom')
var pagesService = require('../../services/pages')

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/search{ext?}',
    handler: function (request, reply) {
      if (request.params.ext && request.params.ext !== '.atom') {
        return reply(Boom.notFound())
      }

      var defaultContext = {
        headTitle: 'Search',
        ga: true,
        admin: false
      }

      var q = request.query.q

      if (q && q.length > 0) {
        defaultContext.q = q

        pagesService.find(q, function (err, results) {
          if (err) {
            reply(err)
          } else {
            var updated
            if (results.length > 0) {
              defaultContext.pages = results
              updated = results[0].updated
            } else {
              defaultContext.genError = 'No results found for query: ' + q
              updated = new Date()
            }

            if (request.params.ext === '.atom') {
              reply.view('search/atom', defaultContext, {
                layout: false
              })
              .header('Content-Type', 'application/atom+xml;charset=UTF-8')
              .header('Last-Modified', updated.toString())
            } else {
              reply.view('search/results', defaultContext)
            }
          }
        })
      } else {
        reply.view('search/form', defaultContext)
      }
    }
  })

  return next()
}

exports.register.attributes = {
  name: 'web/search'
}
