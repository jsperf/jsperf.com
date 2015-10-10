var marked = require('marked')
var Handlebars = require('handlebars')

module.exports = (content) => new Handlebars.SafeString(marked(content))
