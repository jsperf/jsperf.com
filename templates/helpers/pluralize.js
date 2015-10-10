module.exports = function (num, term) {
  if (num !== 1) {
    term += 's'
  }

  return num.toString() + ' ' + term
}
