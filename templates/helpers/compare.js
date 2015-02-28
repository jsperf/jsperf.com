"use strict";

module.exports = function(left, right, options) {
  var operator = options.hash.operator || "<";

  var operators = {
    "<": function(l, r) { return l < r; },
    ">": function(l, r) { return l > r; },
    "<=": function(l, r) { return l <= r; },
    ">=": function(l, r) { return l >= r; },
    "===": function(l, r) { return l === r; }
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
