const Webdriver = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox');

if (!process.env.SELENIUM_REMOTE_URL || !/^https?:\/\//.test(process.env.SELENIUM_REMOTE_URL)) {
  throw new Error('environment variable SELENIUM_REMOTE_URL not defined as url like http://hub:4444/wd/hub');
}

if (!process.env.JSPERF_REMOTE_URL || !/^https?:\/\//.test(process.env.JSPERF_REMOTE_URL)) {
  throw new Error('environment variable JSPERF_REMOTE_URL not defined');
}

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
      'browserName': 'firefox',
      // only required when running against Sauce Labs (usually via Travis)
      'username': process.env.SAUCE_USERNAME,
      'accessKey': process.env.SAUCE_ACCESS_KEY,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    })
    // SELENIUM_REMOTE_URL will be used as the server
    // locally that'll most likely be another Docker container
    // on CI that'll most likely be Sauce Labs
    .build();
};
