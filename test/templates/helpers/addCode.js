var Lab = require('lab')
var Code = require('code')

var addCode = require('../../../templates/helpers/addCode')

var lab = exports.lab = Lab.script()

lab.experiment('Template Helper addCode', function () {
  lab.test('replaces sets of back ticks with code markup', function (done) {
    var res = addCode('My `pretty` Title')
    Code.expect(res).to.be.an.object()
    Code.expect(res.string).to.equal('My <code>pretty</code> Title')

    done()
  })
})
