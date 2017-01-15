const Lab = require('lab');
const Code = require('code');
const Helper = require('./_helper');

const lab = exports.lab = Lab.script();

lab.experiment('Home page', () => {
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
    driver.get(Helper.JSPERF_HOST);

    return driver.getTitle().then(function (title) {
      Code.expect(title).to.include('jsPerf');
      passed = true;
    });
  });

  lab.test('login', () => {
    function clickLoginBtn () {
      return driver.findElement({ css: 'a.login' }).then((el) => el.click());
    }

    return driver.get(Helper.JSPERF_HOST)
    .then(clickLoginBtn)
    .then(() => driver.sleep(1000))
    .then(() => {
      // GitHub Login
      // Note: should use an account _without_ 2FA
      return driver.findElement({ id: 'login_field' })
      .then((el) => el.sendKeys(process.env.E2E_GITHUB_USER))
      .then(() => driver.findElement({ id: 'password' }))
      .then((el) => el.sendKeys(process.env.E2E_GITHUB_PASS))
      .then(() => driver.findElement({ tagName: 'form' }))
      .then((el) => el.submit());
    })
    .then(() => driver.sleep(1000))
    .then(() => {
      // Need to authorize?
      return driver.getTitle().then((title) => {
        if (title.indexOf('Authorize') > -1) {
          // authorize OAuth app in GitHub
          return driver.findElement({ css: 'button.btn.btn-primary' })
          .then((el) => el.click());
        }

        return clickLoginBtn();
      });
    })
    .then(() => driver.findElement({ tagName: 'form' }))
    .then((el) => {
      Code.expect(el).to.exist();
      passed = true;
    });
  });
});
