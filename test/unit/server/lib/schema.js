var Lab = require('lab');
var Code = require('code');
const Joi = require('joi');
const schema = require('../../../../server/lib/schema');

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

    lab.experiment('test array', () => {
      let value;

      lab.beforeEach((done) => {
        value = {
          author: 'Pitcher Man',
          authorEmail: 'kool-aid@kraft.com',
          authorURL: 'http://kool-aid.com',
          authorGitHub: 'koolaidman',
          title: 'oh',
          slug: 'wee',
          info: '',
          initHTML: '',
          setup: '',
          teardown: ''
          // `test` intentionally missing. will be set in each test
        };

        done();
      });

      lab.test('title with code is valid', (done) => {
        value.test = [
          {
            title: 't1',
            code: 't=1'
          },
          {
            title: 't2',
            code: 't=2'
          }
        ];

        Joi.validate(value, schema.testPage, (err) => {
          Code.expect(err).to.not.exist();

          done();
        });
      });

      lab.test('blank title with blank code is valid', (done) => {
        value.test = [
          {
            title: 't1',
            code: 't=1'
          },
          {
            title: '', // intentionally blank
            code: '' // intentionally blank
          },
          {
            title: 't3',
            code: 't=3'
          }
        ];

        Joi.validate(value, schema.testPage, (err, res) => {
          Code.expect(err).to.not.exist();
          Code.expect(res.test[1].title).to.equal('GENERATED_DEFAULT_DELETE_ME');
          Code.expect(res.test[1].code).to.equal('GENERATED_DEFAULT_DELETE_ME');

          done();
        });
      });

      lab.test('blank title with code is invalid', (done) => {
        value.test = [
          {
            title: 't1',
            code: 't=1'
          },
          {
            title: 't2',
            code: 't=2'
          },
          {
            title: '', // intentionally blank
            code: 't=3'
          }
        ];

        Joi.validate(value, schema.testPage, (err, res) => {
          Code.expect(err).to.not.exist();
          Code.expect(res.test[2].title).to.equal('GENERATED_DEFAULT_DELETE_ME');

          done();
        });
      });

      lab.test('title with blank code is invalid', (done) => {
        value.test = [
          {
            title: 't1',
            code: 't=1'
          },
          {
            title: 't2',
            code: 't=2'
          },
          {
            title: 't3',
            code: '' // intentionally blank
          }
        ];

        Joi.validate(value, schema.testPage, (err, res) => {
          Code.expect(err).to.not.exist();
          Code.expect(res.test[2].code).to.equal('GENERATED_DEFAULT_DELETE_ME');

          done();
        });
      });
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
