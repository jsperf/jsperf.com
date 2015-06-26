"use strict";

var mysql = require("mysql");
/*global Promise:true*/
var Promise = require("bluebird");

// This adds Promise ready functions to all these objects.
// So conn.query(something, callback) still works, but now we also have conn.queryAsync(something) which returns a promise.
Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

var config = require("../../config");

exports.createConnection = function() {
  return mysql.createConnection({
    host: config.get("/db/host"),
    port: config.get("/db/port"),
    user: config.get("/db/user"),
    password: config.get("/db/pass"),
    database: config.get("/db/name"),
    // query and rows will print to stdout
    debug: config.get("/debug") ? ["ComQueryPacket", "RowDataPacket"] : false
  });
};
