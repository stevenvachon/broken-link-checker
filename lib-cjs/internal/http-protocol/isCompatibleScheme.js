"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const SCHEMES = ["http:", "https:"];

/**
 * Determine whether a URL supports an HTTP scheme/protocol.
 * @param {URL} url
 * @returns {boolean}
 */
var _default = url => SCHEMES.some(scheme => url.protocol === scheme);
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=isCompatibleScheme.js.map