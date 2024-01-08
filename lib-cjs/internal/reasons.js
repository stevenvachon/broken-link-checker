"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _errno = require("errno");
var _http = require("http");
var _default = exports.default = Object.freeze({
  BLC_CUSTOM: "Custom exclusion",
  BLC_DIRECTORY: "File system directory exclusion",
  BLC_EXTERNAL: "External URL exclusion",
  BLC_HTML: "HTML exclusion",
  BLC_INTERNAL: "Internal URL exclusion",
  BLC_INVALID: "Invalid URL",
  BLC_KEYWORD: "Keyword exclusion",
  BLC_ROBOTS: "Robots exclusion",
  BLC_SAMEPAGE: "Same-Page URL exclusion",
  BLC_UNKNOWN: "Unknown error",
  BLC_UNSUPPORTED: "Unsupported URL",
  // https://github.com/rvagg/node-errno/issues/14
  ERRNO_ENOTFOUND: "no matching dns record (ENOTFOUND)",
  // @todo https://github.com/tc39/proposal-pipeline-operator
  ...Object.fromEntries(_errno.all.map(({
    code,
    description
  }) => [`ERRNO_${code}`, `${description} (${code})`])),
  // @todo https://github.com/tc39/proposal-pipeline-operator
  ...Object.fromEntries(Object.entries(_http.STATUS_CODES).map(([key, value]) => [`HTTP_${key}`, `${value} (${key})`]))
});
module.exports = exports.default;
//# sourceMappingURL=reasons.js.map