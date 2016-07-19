/**
* Base Properties. Default Properties.
**/
const regex = require('./regex');
const MEDIUM_TEXT_LENGTH = 16777215;
exports.mediumTextLength = MEDIUM_TEXT_LENGTH;

exports.errors = {
  title: 'You must enter a title for this test case.',
  slug: 'The slug can only contain alphanumeric characters and hyphens.',
  slugDupe: 'This slug is already in use. Please choose another one.',
  codeTitle: 'Please enter a title for this code snippet.',
  code: 'Please enter a code snippet.',
  general: 'Please review required fields and save again.',
  comment: {
    author: 'Please enter your name.',
    authorEmail: 'Please enter your email address.',
    authorURL: 'Please enter a valid URL or leave it blank',
    message: 'Please enter a message.',
    question: 'Please enter ‘no’ to prove you’re not a spammer.'
  }
};

exports.test = {
  title: '',
  defer: '',
  code: '',
  codeTitleError: null,
  codeError: null
};

exports.testPageContext = {
  home: true,
  showAtom: {
    slug: 'browse'
  },
  jsClass: true,
  mainJS: true,
  mediumTextLength: MEDIUM_TEXT_LENGTH,
  titleError: null,
  slugError: null,
  genError: null,
  slugPattern: regex.slug,
  author: '',
  authorEmail: '',
  authorURL: '',
  title: '',
  slug: '',
  visible: '',
  info: '',
  initHTML: '',
  setup: '',
  teardown: ''
};
