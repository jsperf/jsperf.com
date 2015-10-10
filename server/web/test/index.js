var Boom = require('boom')
var debug = require('debug')('jsperf:web:test')
var hljs = require('highlight.js')
var pagesService = require('../../services/pages')
var regex = require('../../lib/regex')

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/{testSlug}/{rev?}',
    handler: function (request, reply) {
      const rev = request.params.rev ? request.params.rev : 1

      pagesService.getBySlug(request.params.testSlug, rev, function (err, page, tests, revisions, comments) {
        if (err) {
          if (err.message === 'Not found') {
            reply(Boom.notFound('The page was not found'))
          } else {
            reply(err)
          }
        } else {
          page.test = tests
          page.revision = revisions
          page.comments = comments

          const hasSetupOrTeardown = page.setup.length || page.teardown.length
          const hasPrep = page.initHTML.length || hasSetupOrTeardown

          var stripped = false

          if (hasPrep) {
            const reScripts = new RegExp(regex.script, 'i')
            stripped = page.initHTML.replace(reScripts, '')

            var swappedScripts = []

            // highlight the JS inside HTML while highlighting the HTML
            page.initHTMLHighlighted = hljs.highlight('html',
              page.initHTML.replace(reScripts, function (match, open, contents, close) {
                // highlight JS inside script tags
                var highlightedContents = hljs.highlight('js', contents).value
                // store to put back in place later
                swappedScripts.unshift(highlightedContents.replace(/&nbsp;$/, ''))
                // insert marker to replace shortly
                return open + '@jsPerfTagToken' + close
              })).value.replace(/@jsPerfTagToken/, function () {
                // put highlighted JS into highlighted HTML
                return swappedScripts.pop()
              }
            )
          }

          // update hits once per page per session
          var hits = request.session.get('hits') || {}
          if (!hits[page.id]) {
            pagesService.updateHits(page.id, function (e) {
              // TODO: report error some place useful
              if (e) {
                debug(e)
              }

              hits[page.id] = true
              request.session.set('hits', hits)
            })
          }

          var own = request.session.get('own') || {}
          const isOwn = own[page.id]
          const isAdmin = request.session.get('admin')

          reply.view('test/index', {
            benchmark: true,
            showAtom: {
              slug: request.path.slice(1) // remove slash
            },
            jsClass: true,
            isAdmin: isAdmin,
            // Don’t let robots index non-published test cases
            noIndex: page.visible === 'n' && (isOwn || isAdmin),
            pageInit: page.initHTML.includes('function init()'),
            hasPrep: hasPrep,
            hasSetupOrTeardown: hasSetupOrTeardown,
            stripped: stripped,
            page: page
          })
        }
      })
    }
  })

  // TODO: atom feed

  return next()
}

exports.register.attributes = {
  name: 'web/test'
}
