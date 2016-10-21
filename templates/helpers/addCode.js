var Handlebars = require('handlebars');

module.exports = function (str) {
  return new Handlebars.SafeString(str.replace(/`([^`]*)`/g, '<code>$1</code>'));
};
