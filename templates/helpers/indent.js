"use strict";

// more like indentByOneLevel, amirite
function indentByOne(str) {
  return "  " + str;
}

module.exports = function(str) {
  return str.split("\n").map(indentByOne).join("\n");
};
