"use strict";

var Handlebars = require("handlebars");

module.exports = function(str) {
  return new Handlebars.SafeString(str.replace(/`([^`]*)`/, "<code>$1</code>"));
};
