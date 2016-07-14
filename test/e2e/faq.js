const Lab = require('lab');
const Code = require('code');
const Helper = require('./_helper');

const lab = exports.lab = Lab.script();

lab.experiment('FAQ page', () => {
  // FIXME: cannot figure out why this doesn't work
  // let driver;
  // lab.beforeEach((done) => {
  //   driver = Helper.build();
  //   done();
  // });
  //
  // lab.afterEach((done) => {
  //   driver.quit();
  //   done();
  // });
  //
  // lab.test('loads', (done) => {
  //   driver.get('http://192.168.99.100/faq');
  //
  //   driver.getTitle().then(function (title) {
  //     console.log('title is: ' + title);
  //
  //     done();
  //   });
  // });

  lab.test('loads', (done) => {
    const driver = Helper.build();

    driver.get(process.env.JSPERF_REMOTE_URL + '/faq');

    driver.getTitle().then(function (title) {
      Code.expect(title).to.include('Frequent');

      done();
    });

    driver.quit();
  });
});
