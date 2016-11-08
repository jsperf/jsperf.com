module.exports = {
  up: function (genericQuery) {
    return genericQuery(`
      CREATE TABLE IF NOT EXISTS tests (
        testID int(11) NOT NULL AUTO_INCREMENT,
        pageID int(11) NOT NULL,
        title varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        code mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        defer enum('y','n') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'n',
        PRIMARY KEY (testID),
        KEY pageID (pageID)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0;
    `);
  },

  down: function (genericQuery) {
    return genericQuery('DROP TABLE tests;');
  }
};
