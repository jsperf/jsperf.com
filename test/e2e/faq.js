const Lab = require('lab');
const Code = require('code');
const Helper = require('./_helper');

const lab = exports.lab = Lab.script();

lab.experiment('FAQ page', () => {
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

  lab.test('loads', () => {
    driver.get(Helper.JSPERF_HOST + '/faq');

    return driver.getTitle().then(function (title) {
      Code.expect(title).to.include('Frequent');
      passed = true;
    });
  });
});
