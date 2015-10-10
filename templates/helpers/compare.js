const relativeDate = require('./relativeDate')

module.exports = function (left, right, options) {
  var operator = options.hash.operator || '<'

  var operators = {
    '<': (l, r) => l < r,
    '===': (l, r) => l === r,
    'includes': (l, r) => l.indexOf(r) !== -1,
    'diffRelativeDate': (l, r) => relativeDate(l) !== relativeDate(r),
    'isOwner': (l, r) => {
      var isOwner = false
      if (l.author === r.author && l.authorEmail === r.authorEmail && l.authorURL === r.authorURL) {
        // r will most likely be a comment on a test page
        isOwner = r.isOwner = true
      }
      return isOwner
    }
  }

  if (!operators[operator]) {
    throw new Error('Unsupported operator: ' + operator)
  }

  if (operators[operator](left, right)) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
}
