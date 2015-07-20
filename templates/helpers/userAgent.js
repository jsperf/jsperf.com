"use strict";

var parser = require("ua-parser-js");

module.exports = function(ua) {
  var result = parser(ua);

  return result.browser.name + " " + result.browser.version;
};
