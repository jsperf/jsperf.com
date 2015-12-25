const fs = require('fs');
const path = require('path');
const db = require('../server/lib/db');

const tables = ['comments', 'pages', 'tests'];

console.log('creating tables', tables);

tables.forEach(function (table) {
  var fileName = 'create_' + table + '.sql';
  var file = path.resolve(__dirname, 'sql', fileName);
  console.log('reading file', file);

  db.genericQuery(fs.readFileSync(file, { encoding: 'utf8' }))
    .then(function () {
      console.log('created ' + table + ' table', arguments);
    })
    .catch(function (err) {
      console.error(err);
    });
});
