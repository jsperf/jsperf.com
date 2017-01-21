const fs = require('fs');
const path = require('path');
const Webdriver = require('selenium-webdriver');

/*
saucelabs - report status for jobs from CI
*/
let saucelabs;
const username = process.env.SAUCE_USERNAME;
const accessKey = process.env.SAUCE_ACCESS_KEY;

if (process.env.SELENIUM_SERVER) {
  // when using a custom selenium server, mock out saucelabs
  saucelabs = { updateJob: function (a, b, cb) { cb(); } };
} else {
  const SauceLabs = require('saucelabs');

  saucelabs = new SauceLabs({
    username: username,
    password: accessKey
  });

  process.env.SELENIUM_SERVER = `http://${username}:${accessKey}@ondemand.saucelabs.com/wd/hub`;
}

exports.saucelabs = saucelabs;

/*
JSPERF_HOST - standardized host for all tests to use in `get`
*/
exports.JSPERF_HOST = process.env.JSPERF_HOST || 'http://localhost:3000';

/*
build - returns new web driver
*/
exports.build = function () {
  return new Webdriver.Builder()
    .withCapabilities({
      platform: 'MAC',
      browserName: 'chrome',
      version: '54.0',
      username,
      accessKey,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER
    })
    .usingServer(process.env.SELENIUM_SERVER)
    .build();
};

/*
screenshot - takes and stores to `test/e2e/screenshots`
*/
exports.screenshot = function (driver, pathname) {
  return driver.takeScreenshot()
  .then((data) => {
    fs.writeFileSync(
      path.resolve(__dirname, 'screenshots', Date.now() + '-' + pathname + '.png'),
      data,
      { encoding: 'base64' }
    );
  });
};
