const Lab = require('lab');
const Code = require('code');
const Helper = require('./_helper');

const lab = exports.lab = Lab.script();

lab.experiment('FAQ page', () => {
  let driver;
  let sessionID;

  lab.beforeEach(() => {
    driver = Helper.build();

    return driver.getSession()
    .then((session) => session.getId())
    .then((id) => {
      sessionID = id;
    });
  });

  lab.afterEach((done) => {
    Helper.saucelabs.updateJob(sessionID, {
      name: lab._current.experiments[0].tests[0].title,
      passed: true
    }, (err, res) => {
      driver.quit();

      done(err);
    });
  });

  lab.test('loads', () => {
    // driver.get('http://localhost:3000/faq');
    driver.get('http://jsperf.com/faq');

    return driver.getTitle().then(function (title) {
      Code.expect(title).to.include('Frequent');
    });
  });
});
