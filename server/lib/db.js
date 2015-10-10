// TODO make hapi plugin
var mysql = require('mysql')
var config = require('../../config')

module.exports = {
  escape: mysql.escape,
  genericQuery: function (query, values, cb) {
    if (cb === undefined) {
      cb = values
      values = []
    }

    var conn = mysql.createConnection({
      host: config.get('/db/host'),
      port: config.get('/db/port'),
      user: config.get('/db/user'),
      password: config.get('/db/pass'),
      database: config.get('/db/name'),
      // query and rows will print to stdout
      debug: config.get('/debug') ? ['ComQueryPacket', 'RowDataPacket'] : false
    })

    conn.query(query, values, cb)

    conn.end()
  }
}
