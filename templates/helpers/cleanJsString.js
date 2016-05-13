var jsesc = require('jsesc');

// use jscs to make our strings javascript ready
// remove script tags so it doesn't mess with our parent <script> tags
module.exports = (value) => jsesc(
  value,
  {
    wrap: true,
    escapeEtago: true
  }
);
