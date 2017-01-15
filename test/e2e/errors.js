const Lab = require('lab');
const Code = require('code');
const Helper = require('./_helper');

const lab = exports.lab = Lab.script();

lab.experiment('Error pages', () => {
  let driver;
  let sessionID;
  let passed;

  lab.beforeEach(() => {
    passed = false;
    driver = Helper.build();

    return driver.getSession()
    .then((session) => session.getId())
    .then((id) => {
      sessionID = id;
    });
  });

  lab.afterEach((done) => {
    driver.quit();

    Helper.saucelabs.updateJob(sessionID, {
      name: lab._current.experiments[0].tests[0].title,
      passed
    }, done);
  });

  lab.test('404', () => {
    driver.get(Helper.JSPERF_HOST + '/404');

    return driver.findElement({ tagName: 'h1' })
    .then((el) => el.getText())
    .then((str) => {
      Code.expect(str).to.include('Not Found');
      passed = true;
    });
  });
});
