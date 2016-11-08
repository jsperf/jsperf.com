module.exports = {
  up: function (genericQuery) {
    return genericQuery(`
      CREATE TABLE IF NOT EXISTS comments (
        id int(11) NOT NULL AUTO_INCREMENT,
        pageID int(11) NOT NULL,
        author varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        authorEmail varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        authorURL varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        content mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        ip varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        published datetime NOT NULL,
        PRIMARY KEY (id),
        KEY pageID (pageID)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0;
    `);
  },

  down: function (genericQuery) {
    return genericQuery('DROP TABLE comments;');
  }
};
