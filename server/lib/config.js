"use strict";

exports.normalizeDomain = function() {
  if (
    // for github oauth, if someone didn't include the port in their domain ...
    process.env.DOMAIN.indexOf(":") < 0 &&
    (
      // ... and they aren't using a default port w/ scheme ...
      (
        process.env.SCHEME === "https" &&
        process.env.PORT !== "443"
      ) ||
      (
        process.env.SCHEME === "http" &&
        process.env.PORT !== "80"
      )
    )
  ) {
    // ... include the port in their domain for redirect_uri
    process.env.DOMAIN += ":" + process.env.PORT;
  }
};
