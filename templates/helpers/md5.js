"use strict";

var crypto = require("crypto");

module.exports = function(data) {
  return crypto.createHash("md5").update(data).digest("hex");
};
