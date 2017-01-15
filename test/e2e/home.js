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

  lab.test('create page', () => {
    function login () {
      function clickLoginBtn () {
        return driver.findElement({ css: 'a.login' }).then((el) => el.click());
      }

      return clickLoginBtn()
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
      .then(() => {
        // Need to (re-)authorize?
        return driver.getTitle().then((title) => {
          if (title.indexOf('Authorize') > -1) {
            // authorize OAuth app in GitHub
            return driver.findElement({ css: 'button.btn.btn-primary' })
            .then((el) => el.click());
          }
        });
      })
      .then(() => driver.findElements({ tagName: 'form' })
        .then((els) => {
          // already logged in
          if (els.length === 0) {
            // sometimes returning from GitHub requires another button click
            return clickLoginBtn()
            .then(() => driver.findElements({ tagName: 'form' })
              .then((els) => {
                Code.expect(els).to.have.length(1);
                return els[0];
              })
            );
          }

          Code.expect(els).to.have.length(1);
          return els[0];
        }));
    }

    return driver.get(Helper.JSPERF_HOST)
    .then(() => driver.findElements({ tagName: 'form' }))
    .then((els) => {
      // if form is displayed on home page, we are logged in
      if (els.length === 0) {
        return login();
      }

      Code.expect(els).to.have.length(1);
      return els[0];
    })
    .then((formEl) => {
      // fill out form
      function fillOut (id, value) {
        return driver.findElement({ id }).then((el) => el.sendKeys(value));
      }

      function check (id) {
        return driver.findElement({ id }).then((el) => el.click());
      }

      const now = Date.now();

      return Promise.all([
        fillOut('author', 'Max Tester'),
        fillOut('authorEmail', 'test@jsperf.test'),
        fillOut('authorURL', 'http://jsperf.test'),
        fillOut('title', 'Test ' + now),
        check('visible'),
        fillOut('info', 'This is my test at ' + now),
        fillOut('initHTML', `<p>${now}</p>`),
        fillOut('setup', 'var a = [];'),
        fillOut('teardown', 'delete a;'),
        fillOut('test[0][title]', `Title ${now} 0`),
        // TODO defer checkbox
        fillOut('test[0][code]', `a.push(${now});`),
        fillOut('test[1][title]', `Title ${now} 1`),
        // TODO defer checkbox
        fillOut('test[1][code]', `a[0] = ${now};`)
      ])
      .then(() => formEl.submit());
    })
    .then(() => driver.getCurrentUrl())
    .then((newUrl) => {
      // should redirect to new /slug page
      Code.expect(newUrl.length).to.be.greaterThan(Helper.JSPERF_HOST.length);
      passed = true;
    });
  });

  lab.test('browse', () => {
    let slug;
    return driver.get(Helper.JSPERF_HOST)
    .then(() => driver.findElement({ linkText: 'Latest' }).then((el) => el.click()))
    .then(() => driver.getTitle().then((title) => {
      Code.expect(title).to.include('Browse');

      return driver.findElement({ css: 'article ul li a' })
        .then((el) => {
          el.getAttribute('href').then((href) => {
            slug = href;
          });
          return el.click();
        });
    }))
    .then(() => driver.getCurrentUrl())
    .then((newUrl) => {
      Code.expect(newUrl).to.include(slug);
      passed = true;
    });
  });
});
