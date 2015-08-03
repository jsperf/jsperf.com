"use strict";

var fs = require("fs");
var path = require("path");
var prompt = require("prompt");
var mysql = require("mysql");

var schema = {
  properties: {
    scheme: {
      description: "Scheme for node server",
      pattern: /^(https?)$/,
      message: "Must be either 'http' or 'https'",
      required: true,
      default: "http"
    },
    domain: {
      description: "Local domain for node server",
      format: "host-name",
      required: true,
      default: "dev.jsperf.com"
    },
    port: {
      description: "Port for node server",
      message: "Should be a high port like 3000",
      required: false,
      default: 3000
    },
    admin: {
      properties: {
        email: {
          description: "Email to send admin things to",
          format: "email",
          required: false
        }
      }
    },
    browserscope: {
      description: "Browserscope.org API key",
      message: "See README for instructions on how to get one",
      required: true
    },
    db: {
      properties: {
        host: {
          description: "Database host",
          required: false,
          default: "localhost"
        },
        port: {
          description: "Database port",
          required: true,
          default: 3306
        },
        user: {
          description: "Database username",
          required: true
        },
        pass: {
          description: "Database password",
          hidden: true,
          required: false,
          default: ""
        },
        name: {
          description: "Database name",
          required: false,
          default: "jsperf_dev"
        }
      }
    },
    "bell_cookie": {
      properties: {
        pass: {
          description: "Cookie Password for Oauth",
          required: true,
          default: ""
        }
      }
    },
    cookie: {
      properties: {
        pass: {
          description: "Cookie Password",
          required: true,
          default: ""
        }
      }
    },
    "github_client": {
      properties: {
        id: {
          description: "GitHub Client ID",
          required: true,
          default: ""
        },
        secret: {
          description: "GitHub Client Secret",
          required: true,
          default: ""
        }
      }
    }
  }
};

// use existing env vars
require("dotenv").load();

// process.env.DB_HOST => { db: { host: "" } }
// warning: nested prompts not supported yet https://github.com/flatiron/prompt/issues/47
var unbuildVars = function() {
  var overrides = {};
  let prop;

  for (prop in schema.properties) {
    let p = schema.properties[prop];

    if (p.properties) {
      overrides[prop] = {};
      let nestedProp;

      for (nestedProp in p.properties) {
        overrides[prop][nestedProp] = process.env[prop.toUpperCase() + "_" + nestedProp.toUpperCase()];
      }
    } else {
      overrides[prop] = process.env[prop.toUpperCase()];
    }
  }

  return overrides;
};

prompt.override = unbuildVars();

prompt.start();

// { db: { host: "localhost" } } => DB_HOST=localhost
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

prompt.get(schema, function(er, result) {
  if (er) {
    throw er;
  }

  fs.writeFileSync(".env", buildVars("NODE_ENV=development\n", result));

  console.log("Thanks! You can change these later in the .env file");

  var conn = mysql.createConnection({
    host: result.db.host,
    port: result.db.port,
    user: result.db.user,
    password: result.db.pass
  });

  conn.connect(function(e) {
    if (e) {
      console.error("failed to connect to database:", e.stack);
      throw e;
    }

    console.log("Connected to database...");

    conn.query("CREATE DATABASE IF NOT EXISTS " + result.db.name, function(err) {
      if (err) {
        throw err;
      }

      console.log("Successfully created database");
    });

    var grantQuery = "GRANT ALL ON " + result.db.name + ".* TO " + conn.escape(result.db.user) + "@" + conn.escape(result.db.host);
    if (result.db.pass.length > 0) {
      grantQuery += " IDENTIFIED BY " + conn.escape(result.db.pass);
    }

    conn.query(grantQuery, function(err) {
      if (err) {
        throw err;
      }

      console.log("Granted permissions to your user");
    });

    conn.query("FLUSH PRIVILEGES", function(err) {
      if (err) {
        throw err;
      }
    });

    conn.query("USE " + result.db.name, function(err) {
      if (err) {
        throw err;
      }

      console.log("Prepared to create tables");
    });

    ["comments", "pages", "tests"].forEach(function(table) {
      var fileName = "create_" + table + ".sql";

      conn.query(
        fs.readFileSync(
          path.join(__dirname, "sql", fileName),
          { encoding: "utf8" }
        ),
        function(err) {
          if (err) {
            throw err;
          }

          console.log("Created " + table + " table");
        }
      );
    });

    conn.end();
  });

});
