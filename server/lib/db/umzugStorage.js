const table = 'migrations';

class CustomStorage {
  constructor (options) {
    this.genericQuery = options.storageOptions.genericQuery;
  }

  logMigration (migrationName) {
    // This function logs a migration as executed.
    // It will get called once a migration was
    // executed successfully.
    return this.genericQuery('INSERT INTO ?? SET ?', [ table, { name: migrationName } ]);
  }

  unlogMigration (migrationName) {
    // This function removes a previously logged migration.
    // It will get called once a migration has been reverted.
    return this.genericQuery('DELETE FROM ?? WHERE `name` = ? LIMIT 1;', [ table, migrationName ]);
  }

  executed () {
    // This function lists the names of the logged
    // migrations. It will be used to calculate
    // pending migrations. The result has to be an
    // array with the names of the migration files.
    return this.genericQuery('SELECT name FROM ?? ORDER BY id ASC;', [ table ])
    .then((rows) => rows.map((r) => r.name))
    .catch((err) => {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        // first run
        return [];
      }

      throw err;
    });
  }
}

module.exports = CustomStorage;
