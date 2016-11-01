module.exports = {
  up: function (genericQuery) {
    return genericQuery(`
      CREATE TABLE IF NOT EXISTS migrations (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        tstamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0;
    `);
  },

  down: function (genericQuery) {
    return genericQuery('DROP TABLE migrations;');
  }
};
