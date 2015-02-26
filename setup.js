"use strict";

var fs = require("fs");
var prompt = require("prompt");

var schema = {
  properties: {
    port: {
      type: "number",
      description: "Port for node server to run on",
      message: "Should be a high port like 3000",
      required: false,
      default: 3000
    },
    // TODO: admin email

    // TODO: browserscope api key

    db: {
      properties: {
        host: {
          description: "Database host",
          required: false,
          default: "localhost"
        },
        user: {
          description: "Database username",
          type: "string",
          required: true
        },
        pass: {
          description: "Database password",
          type: "string",
          hidden: true,
          required: false,
          default: ""
        },
        name: {
          description: "Database name",
          type: "string",
          required: false,
          default: "jsperf_dev"
        }
      }
    }
  }
};

prompt.start();

var buildVars = function(dest, obj, prefix) {
  if (!prefix) {
    prefix = "";
  }

  for (var prop in obj) {
    var k = prop.toUpperCase();
    var v = obj[prop];

    if (v instanceof Object) {
      dest = buildVars(dest, v, k + "_");
    } else {
      dest += prefix + k + "=" + v + "\n";
    }
  }

  return dest;
};

prompt.get(schema, function(err, result) {
  if (err) {
    throw err
  }

  fs.writeFileSync(".env", buildVars("", result));

  console.log("Thanks! You can change these later in the .env file");

});
