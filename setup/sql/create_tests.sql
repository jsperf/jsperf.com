CREATE TABLE IF NOT EXISTS `tests` (
  `testID` int(11) NOT NULL AUTO_INCREMENT,
  `pageID` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `code` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `defer` enum('y','n') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'n',
  PRIMARY KEY (`testID`),
  KEY `pageID` (`pageID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=0;
