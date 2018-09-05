"use strict"

function httpHeaders(options) {
  var headers = options.httpHeaders || {};

  headers["user-agent"] = options.userAgent

  return headers;
}

module.exports = httpHeaders;
