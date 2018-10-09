module.exports = {
  up: function (genericQuery) {
    return genericQuery(`
      ALTER TABLE comments ADD COLUMN authorGitHub varchar(39) NOT NULL AFTER author, ADD INDEX gh_username (authorGitHub);
    `);
  },

  down: function (genericQuery) {
    return genericQuery(`
      ALTER TABLE comments DROP COLUMN authorGithub, DROP INDEX gh_username;
    `);
  }
};
