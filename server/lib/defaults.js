/**
* Base Properties. Default Properties.
**/
const regex = require('./regex');
const MEDIUM_TEXT_LENGTH = 16777215;
exports.mediumTextLength = MEDIUM_TEXT_LENGTH;

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
