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
    driver.quit();

    Helper.saucelabs.updateJob(sessionID, {
      name: lab._current.experiments[0].tests[0].title,
      passed: true
    }, done);
  });

  lab.test('loads', () => {
    driver.get('http://localhost:3000/faq');

    return driver.getTitle().then(function (title) {
      Code.expect(title).to.include('Frequent');
    });
  });
});
