var seconds = (n) => n * 1000;

var minutes = (n) => seconds(n) * 60;

var hours = (n) => minutes(n) * 60;

var days = (n) => hours(n) * 24;

var weeks = (n) => days(n) * 7;

var invert = {
  second: (n) => n / 1000,
  minute: function (n) {
    return this.second(n) / 60;
  },
  hour: function (n) {
    return this.minute(n) / 60;
  },
  day: function (n) {
    return this.hour(n) / 24;
  },
  week: function (n) {
    return this.day(n) / 7;
  }
};

var niceTime = function (num, unit) {
  num = Math.round(invert[unit](num));
  return num + ' ' + unit + (num !== 1 ? 's' : '') + ' ago';
};

module.exports = function (date) {
  var diff = Date.now() - date.getTime();

  if (diff < seconds(5)) {
    return 'just now';
  }

  if (diff < minutes(1)) {
    return niceTime(diff, 'second');
  }

  if (diff < hours(1)) {
    return niceTime(diff, 'minute');
  }

  if (diff < days(1)) {
    return niceTime(diff, 'hour');
  }

  if (diff < weeks(1)) {
    return niceTime(diff, 'day');
  }

  if (diff < weeks(4)) {
    return niceTime(diff, 'week');
  }

  return 'on ' + date.toLocaleDateString();
};
