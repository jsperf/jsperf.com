"use strict";

var Handlebars = require("handlebars");
var hljs = require("highlight.js");

module.exports = function(code, lang) {
  var result = hljs.highlight(lang, code);
  return new Handlebars.SafeString("<pre><code class=\"" + lang + "\">" + result.value + "</code></pre>");
};
