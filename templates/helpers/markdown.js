"use strict";

var marked = require("marked");
var Handlebars = require("handlebars");

module.exports = function(content) {
  return new Handlebars.SafeString(marked(content));
};
