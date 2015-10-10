var Lab = require('lab')
var Code = require('code')
var proxyquire = require('proxyquire')

var highlight = proxyquire('../../../templates/helpers/highlight', {
  'highlight.js': {
    highlight: function (lang, code) {
      return {
        value: '<span class="pretty">' + code + '</span>'
      }
    }
  }
})

var lab = exports.lab = Lab.script()

lab.experiment('Template Helper highlight', function () {
  lab.test('returns highlighted syntax wrapped in pre+code', function (done) {
    var res = highlight('1', 'js')

    Code.expect(res.toString()).to.equal('<pre><code class="js"><span class="pretty">1</span></code></pre>')

    done()
  })
})
