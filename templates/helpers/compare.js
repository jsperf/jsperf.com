"use strict";

module.exports = function(left, right, options) {
  var operator = options.hash.operator || "<";

  var operators = {
    "<": function(l, r) { return l < r; },
    "===": function(l, r) { return l === r; },
    "includes": function(l, r) { return l.indexOf(r) !== -1; }
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
