var Lab = require('lab');
var Code = require('code');
const schema = require('../../../server/lib/schema');

var lab = exports.lab = Lab.script();

lab.experiment('Schema Library', function () {
  lab.experiment('Medium Text', function () {
    lab.test('is a Joi schema', function (done) {
      const joiDesc = schema.mediumText.describe();
      Code.expect(Array.isArray(joiDesc.rules)).to.be.true();

      done();
    });
  });

  lab.experiment('Test Page', function () {
    lab.test('is a Joi schema', function (done) {
      const joiDesc = schema.testPage.describe();
      Code.expect(joiDesc.type).to.equal('object');

      done();
    });
  });

  lab.experiment('comment', function () {
    lab.test('is a Joi schema', function (done) {
      const joiDesc = schema.comment.describe();
      Code.expect(joiDesc.type).to.equal('object');

      done();
    });
  });
});
