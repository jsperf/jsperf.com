const Lab = require('lab');
const Code = require('code');
const sinon = require('sinon');

const CustomStorage = require('../../../../../server/lib/db/umzugStorage');

const lab = exports.lab = Lab.script();

lab.experiment('Custom Umzug Storage', () => {
  lab.test('constructs', (done) => {
    Code.expect(new CustomStorage({
      genericQuery: () => {}
    })).to.be.instanceof(CustomStorage);

    done();
  });

  lab.test('logMigration', (done) => {
    const c = new CustomStorage({
      genericQuery: sinon.stub().returns(Promise.resolve())
    });

    c.logMigration('1-test.js').then(done);
  });

  lab.test('unlogMigration', (done) => {
    const c = new CustomStorage({
      genericQuery: sinon.stub().returns(Promise.resolve())
    });

    c.unlogMigration('1-test.js').then(done);
  });

  lab.experiment('executed', (done) => {
    lab.test('returns array of completed migrations', (done) => {
      const c = new CustomStorage({
        genericQuery: sinon.stub().returns(Promise.resolve([{ name: '1-test.js' }]))
      });

      c.executed().then((names) => {
        Code.expect(names).to.equal(['1-test.js']);
        done();
      });
    });

    lab.test('returns empty array if table does not exist', (done) => {
      const err = new Error();
      err.code = 'ER_NO_SUCH_TABLE';

      const c = new CustomStorage({
        genericQuery: sinon.stub().returns(Promise.reject(err))
      });

      c.executed().then((names) => {
        Code.expect(names).to.equal([]);
        done();
      });
    });

    lab.test('passes along unknown errors', (done) => {
      const testMsg = 'testingunknown';
      const c = new CustomStorage({
        genericQuery: sinon.stub().returns(Promise.reject(new Error(testMsg)))
      });

      c.executed().catch((err) => {
        Code.expect(err.message).to.equal(testMsg);
        done();
      });
    });
  });
});
