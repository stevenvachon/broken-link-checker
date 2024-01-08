"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _defaultOptions = _interopRequireDefault(require("./defaultOptions"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const HAS_BEEN_PARSED_VALUE = Symbol();

/**
 * Combine consumer options with defaults, then normalize/optimize.
 * @param {object} [options]
 * @returns {object}
 */
var _default = (options = {}) => {
  if (options.__parsed !== HAS_BEEN_PARSED_VALUE) {
    options = {
      ..._defaultOptions.default,
      ...options
    };

    // https://npmjs.com/request-methods-constants are upper case
    options.requestMethod = options.requestMethod.toUpperCase();

    // Undocumented -- avoids reparsing options passed through from class to class
    options.__parsed = HAS_BEEN_PARSED_VALUE;
  }
  return options;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=parseOptions.js.map