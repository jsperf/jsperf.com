"use strict";

// strings because comparing to process.env which is always strings
const HTTPS_PORT = "443";
const HTTP_PORT = "80";

exports.normalizeDomain = function() {
  // for github oauth ...
  if (
    // ... anywhere but production environments ...
    process.env.NODE_ENV !== "production" &&
    // ... if someone didn't include the port in their domain ...
    process.env.DOMAIN.indexOf(":") < 0 &&
    (
      // ... and they aren't using a default port w/ scheme ...
      (
        process.env.SCHEME === "https" &&
        process.env.PORT !== HTTPS_PORT
      ) ||
      (
        process.env.SCHEME === "http" &&
        process.env.PORT !== HTTP_PORT
      )
    )
  ) {
    // ... include the port in their domain for redirect_uri
    process.env.DOMAIN += ":" + process.env.PORT;
  }
};
