const Lab = require('lab');
const Code = require('code');
const Proxyquire = require('proxyquire').noPreserveCache();

const Config = require('../../config');

const lab = exports.lab = Lab.script();

lab.experiment('Config', function () {
  lab.test('it gets config data', function (done) {
    Code.expect(Config.get('/')).to.be.an.object();
    done();
  });

  lab.test('it gets config meta data', function (done) {
    Code.expect(Config.meta('/')).to.match(/jsPerf/i);
    done();
  });

  lab.experiment('defaults', () => {
    lab.test('it gets scheme', (done) => {
      Code.expect(Config.get('/scheme')).to.equal('http');
      done();
    });

    lab.test('it gets port', (done) => {
      Code.expect(Config.get('/port')).to.equal(3000);
      done();
    });

    lab.test('it gets domain', (done) => {
      Code.expect(Config.get('/domain')).to.equal('localhost');
      done();
    });

    lab.test('it gets mysql host', (done) => {
      Code.expect(Config.get('/mysql/host')).to.equal('localhost');
      done();
    });

    lab.test('it gets mysql port', (done) => {
      Code.expect(Config.get('/mysql/port')).to.equal(3306);
      done();
    });
  });

  lab.experiment('Cookies', function () {
    lab.test('it secures the bell cookie if the scheme is https', function (done) {
      Code.expect(Config.get('/auth/oauth/secure', {scheme: 'https'})).to.equal(true);
      done();
    });

    lab.test('it does not secure the bell cookie if the scheme is http', function (done) {
      Code.expect(Config.get('/auth/oauth/secure', {scheme: 'http'})).to.equal(false);
      done();
    });

    lab.test('it does not secure the general cookie if the scheme is http', function (done) {
      Code.expect(Config.get('/auth/session/secure', {scheme: 'http'})).to.equal(false);
      done();
    });

    lab.test('it secures the general cookie if the scheme is https', function (done) {
      Code.expect(Config.get('/auth/session/secure', {scheme: 'https'})).to.equal(true);
      done();
    });
  });

  lab.test('validates process.env', (done) => {
    Code.expect(function () {
      Proxyquire('../../config', {
        'joi': {
          validate: () => ({
            error: {
              details: [
                {
                  path: 'TESTING'
                }
              ]
            }
          })
        }
      });
    }).to.throw(Error);

    done();
  });
});
