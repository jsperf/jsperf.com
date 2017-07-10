const defaults = require('../lib/defaults');

const name = 'repositories/tests';
const table = 'tests';

exports.register = function (server, options, next) {
  const db = server.plugins.db;
  const columns = ['pageID', 'title', 'defer', 'code'];

  server.expose('bulkCreate', function (pageID, tests) {
    var values = [];
    for (var i = 0, tl = tests.length; i < tl; i++) {
      var test = tests[i];
      values.push('(' + pageID + ', ' + db.escape(test.title) + ', ' + db.escape(test.defer) + ', ' + db.escape(test.code) + ')');
    }

    values = values.join(', ');

    return db.genericQuery('INSERT INTO ?? (??) VALUES ' + values, [table, columns])
      .then(function (result) {
        if (result.affectedRows !== tests.length) {
          throw new Error('Not all tests inserted');
        }
      });
  });

  server.expose('bulkUpdate', function (pageID, tests, isOwn) {
    let queries = [];

    tests.forEach(test => {
      // setting existing test title and code to blank indicates it should be deleted
      // Joi converts this to the default ...
      if (test.title === defaults.deleteMe && test.code === defaults.deleteMe) {
        // ... if it's theirs to delete ...
        if (isOwn && test.testID) {
          server.log('info', `deleting test ${test.testID} from page ${pageID}`);
          queries.push(db.genericQuery(`DELETE FROM ?? WHERE pageID = ${pageID} AND testID = ${test.testID}`, [table]));
        }
        // ... otherwise skip over the test
      } else {
        if (test.testID) {
          queries.push(db.genericQuery(`UPDATE ?? SET title = ${db.escape(test.title)}, defer =  ${db.escape(test.defer)} , code =  ${db.escape(test.code)} WHERE pageID = ${pageID} AND testID = ${test.testID}`, [table]));
        } else {
          queries.push(db.genericQuery(`INSERT INTO ?? (??) VALUES (${pageID}, ${db.escape(test.title)}, ${db.escape(test.defer)}, ${db.escape(test.code)})`, [table, columns]));
        }
      }
    });

    return Promise.all(queries).then((results) => {
      server.log(['debug'], `${name}::bulkUpdate results - ${JSON.stringify(results)}`);
      results.forEach((result) => {
        server.log(['debug'], `${name}::bulkUpdate result - ${JSON.stringify(result)}`);
        if (result.affectedRows !== 1) {
          throw new Error('Not all tests inserted');
        }
      });

      return Promise.resolve(results);
    });
  });

  server.expose('findByPageID', function (pageID) {
    server.log(['debug'], `${name}::findByPageID: ${JSON.stringify(arguments)}`);

    return db.genericQuery('SELECT * FROM ?? WHERE pageID = ?', [table, pageID]);
  });

  return next();
};

exports.register.attributes = {
  name,
  dependencies: ['db']
};
