"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Determine whether a URL supports a file scheme/protocol.
 * @param {URL} url
 * @returns {boolean}
 */
var _default = url => url.protocol === "file:";
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=isCompatibleScheme.js.map