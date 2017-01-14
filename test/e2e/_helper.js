const Webdriver = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox');
const SauceLabs = require('saucelabs');

const username = process.env.SAUCE_USERNAME;
const accessKey = process.env.SAUCE_ACCESS_KEY;

const saucelabs = new SauceLabs({
  username: username,
  password: accessKey
});

exports.saucelabs = saucelabs;

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});

const ffProfile = new Firefox.Profile();
// prevent hosts being turned into www.hosts.com
ffProfile.setPreference('browser.fixup.alternate.enabled', false);

const ffOptions = new Firefox.Options().setProfile(ffProfile);

exports.build = function () {
  return new Webdriver.Builder()
    .setFirefoxOptions(ffOptions)
    .withCapabilities({
      browserName: 'firefox',
      platform: 'macOS 10.12',
      version: '50.0',
      username,
      accessKey,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER
    })
    .usingServer(`http://${username}:${accessKey}@ondemand.saucelabs.com/wd/hub`)
    .build();
};
