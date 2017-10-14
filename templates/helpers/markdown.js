const marky = require('marky-markdown');
const Handlebars = require('handlebars');

module.exports = (content) => new Handlebars.SafeString(marky(content));
