"use strict";

var fs = require("fs");
var path = require("path");
var prompt = require("prompt");
var mysql = require("mysql");

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
        port: {
          description: "Database port",
          type: "number",
          required: true,
          default: 3306
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
    throw er
  }

  fs.writeFileSync(".env", buildVars("", result));

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
      throw e
    }

    console.log("Connected to database...");

    conn.query("CREATE DATABASE IF NOT EXISTS " + result.db.name, function(err) {
      if (err) {
        throw err
      }

      console.log("Successfully created database");
    });

    var grantQuery = "GRANT ALL ON " + result.db.name + ".* TO " + conn.escape(result.db.user) + "@" + conn.escape(result.db.host);
    if (result.db.pass.length > 0) {
      grantQuery += " IDENTIFIED BY " + conn.escape(result.db.pass);
    }

    conn.query(grantQuery, function(err) {
      if (err) {
        throw err
      }

      console.log("Granted permissions to your user");
    });

    conn.query("FLUSH PRIVILEGES", function(err) {
      if (err) {
        throw err
      }
    });

    conn.query("USE " + result.db.name, function(err) {
      if (err) {
        throw err
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
            throw err
          }

          console.log("Created " + table + " table");
        }
      );
    });

    conn.end();
  });

});
