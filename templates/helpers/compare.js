"use strict";

let relativeDate = require("./relativeDate");

module.exports = function(left, right, options) {
  var operator = options.hash.operator || "<";

  var operators = {
    "<": function(l, r) { return l < r; },
    "===": function(l, r) { return l === r; },
    "includes": function(l, r) { return l.indexOf(r) !== -1; },
    "diffRelativeDate": function(l, r) { return relativeDate(l) !== relativeDate(r); },
    "isOwner": function(l, r) {
      var isOwner = false;
      if (l.author === r.author && l.authorEmail === r.authorEmail && l.authorURL === r.authorURL) {
        // r will most likely be a comment on a test page
        isOwner = r.isOwner = true;
      }
      return isOwner;
    }
  };

  if (!operators[operator]) {
    throw new Error("Unsupported operator: " + operator);
  }

  if (operators[operator](left, right)) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};
