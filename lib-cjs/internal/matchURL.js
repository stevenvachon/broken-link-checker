"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _matcher = require("matcher");
/**
 * Determine if a URL contains at least one—possibly glob'bed—keyword.
 * @param {string} url
 * @param {Array<string>} keywords
 * @returns {boolean}
 */
var _default = (url, keywords) => keywords.some(keyword => {
  // Check for literal keyword
  if (url.includes(keyword)) {
    return true;
  } else {
    // Check for glob
    return (0, _matcher.isMatch)(url, keyword);
  }
});
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=matchURL.js.map