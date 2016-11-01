module.exports = {
  up: function (genericQuery) {
    return genericQuery(`
      CREATE TABLE IF NOT EXISTS \`umzugMigrations\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT;
        \`name\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`tstamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0;

      CREATE TABLE IF NOT EXISTS \`comments\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`pageID\` int(11) NOT NULL,
        \`author\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`authorEmail\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`authorURL\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`content\` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        \`ip\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`published\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`pageID\` (\`pageID\`)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0;

      CREATE TABLE IF NOT EXISTS \`pages\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`slug\` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`revision\` int(4) NOT NULL DEFAULT 1,
        \`browserscopeID\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        \`title\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`info\` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        \`setup\` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        \`teardown\` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        \`initHTML\` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        \`visible\` enum('y','n') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'y',
        \`author\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`authorEmail\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`authorURL\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`hits\` bigint(20) NOT NULL DEFAULT 0,
        \`published\` datetime NOT NULL,
        \`updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`browserscopeID\` (\`browserscopeID\`),
        KEY \`slugRev\` (\`slug\`,\`revision\`),
        KEY \`updated\` (\`updated\`),
        KEY \`author\` (\`author\`),
        KEY \`visible\` (\`visible\`)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0;

      CREATE TABLE IF NOT EXISTS \`tests\` (
        \`testID\` int(11) NOT NULL AUTO_INCREMENT,
        \`pageID\` int(11) NOT NULL,
        \`title\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        \`code\` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
        \`defer\` enum('y','n') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'n',
        PRIMARY KEY (\`testID\`),
        KEY \`pageID\` (\`pageID\`)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0;

    `);
  },

  down: function (genericQuery) {
    return genericQuery('DROP TABLE `umzugMigrations`, `comments`, `pages`, `tests`;');
  }
};
