exports.register = function (server, options, next) {
  var redirects = [
    {
      path: '/@',
      redirect: 'https://twitter.com/jsperf'
    }, {
      path: '/dart-disclaimer',
      redirect: '/dart'
    }, {
      path: '/document-head-speed-test',
      redirect: '/document-head'
    }, {
      path: '/testing',
      redirect: '/accessing-dom-elements'
    }, {
      path: '/array-creating',
      redirect: '/literal-vs-constructor-array'
    }, {
      path: '/jquery-each2-vs-quickeach-vs-each',
      redirect: '/jquery-each-vs-quickeach/2'
    }, {
      path: '/equlity-operators-with-the-same-types',
      redirect: '/equality-operators-with-the-same-types'
    }, {
      path: '/math-min-a-b-vs-a-b-a-b',
      redirect: '/math-vs-greater-than'
    }, {
      path: '/remove-all-child-nodes',
      redirect: '/removechildren/3'
    }, {
      path: '/donate',
      redirect: '/faq#donate'
    }
  ]

  var handler = function (url) {
    return function (request, reply) {
      reply.redirect(url).permanent()
    }
  }

  for (var i = 0, rl = redirects.length; i < rl; i++) {
    server.route({
      method: 'GET',
      path: redirects[i].path,
      handler: handler(redirects[i].redirect)
    })
  }

  return next()
}

exports.register.attributes = {
  name: 'web/redirects'
}
