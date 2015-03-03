"use strict";

var mysql = require("mysql");

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
