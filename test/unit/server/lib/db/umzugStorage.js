const Lab = require('lab');
const Code = require('code');
const sinon = require('sinon');

const CustomStorage = require('../../../../../server/lib/db/umzugStorage');

const lab = exports.lab = Lab.script();

lab.experiment('Custom Umzug Storage', () => {
  lab.test('constructs', (done) => {
    Code.expect(new CustomStorage({
      storageOptions: { genericQuery: () => {} }
    })).to.be.instanceof(CustomStorage);

    done();
  });

  lab.test('logMigration', (done) => {
    const c = new CustomStorage({
      storageOptions: { genericQuery: sinon.stub().returns(Promise.resolve()) }
    });

    c.logMigration('1-test.js').then(done);
  });

  lab.test('unlogMigration', (done) => {
    const c = new CustomStorage({
      storageOptions: { genericQuery: sinon.stub().returns(Promise.resolve()) }
    });

    c.unlogMigration('1-test.js').then(done);
  });

  lab.test('executed', (done) => {
    const c = new CustomStorage({
      storageOptions: { genericQuery: sinon.stub().returns(Promise.resolve([{ name: '1-test.js' }])) }
    });

    c.executed().then((names) => {
      Code.expect(names).to.equal(['1-test.js']);
      done();
    });
  });
});
