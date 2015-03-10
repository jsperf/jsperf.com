"use strict";

var Handlebars = require("handlebars");

module.exports = function(msg, options) {
  var result;
  var tag = options.hash.tag || "span";
  if (msg) {
    result = new Handlebars.SafeString("<" + tag + " class=\"error\">" + msg + "</" + tag + ">");
  }

  return result;
};
