"use strict";

var http = require("http");
var querystring = require("querystring");

var config = require("../../config");

module.exports = {
  addTest: function(title, description, slug) {
    return new Promise(function(resolve, reject) {
      var qs = querystring.stringify({
        "api_key": config.get("/browserscope"),
        name: title,
        description: description.substr(0, 60),
        url: `${config.get("/scheme")}://${config.get("/domain")}/${slug}`
      });

      http.get("http://www.browserscope.org/user/tests/create?" + qs, function(res) {
        var str = "";

        res.on("data", function(chunk) {
          str += chunk;
        });

        res.on("end", function() {
          resolve(JSON.parse(str).test_key);
        });

      }).on("error", reject);
    });
  }
};
