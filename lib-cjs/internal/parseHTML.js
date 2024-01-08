"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default2 = _interopRequireDefault(require("parse5/lib/tree-adapters/default"));
var _isStream = _interopRequireDefault(require("is-stream"));
var _isString = _interopRequireDefault(require("is-string"));
var _parse = require("parse5");
var _parse5ParserStream = _interopRequireDefault(require("parse5-parser-stream"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const ERROR_EVENT = "error";
const FINISH_EVENT = "finish";
const OPTIONS = {
  sourceCodeLocationInfo: true,
  treeAdapter: {
    ..._default2.default,
    createElement: (...args) => {
      const result = _default2.default.createElement(...args);
      result.attrMap = simplifyAttrs(result.attrs);
      return result;
    }
  }
};

/**
 * Convert a list of parse5 attributes into key-value pairs.
 * Note: spec-compliant HTML cannot have multiple attrs of the same name.
 * @param {Array} attrs
 * @returns {object}
 *
 * @todo https://github.com/tc39/proposal-pipeline-operator
 */
const simplifyAttrs = attrs => Object.fromEntries(attrs.map(({
  name,
  value
}) => [name, value]));

/**
 * Parse an HTML stream/string and return a tree.
 * @param {Stream|string} input
 * @throws {TypeError} non-Stream or non-string
 * @returns {Promise<object>}
 */
var _default = input => new Promise((resolve, reject) => {
  if ((0, _isStream.default)(input)) {
    const parser = new _parse5ParserStream.default(OPTIONS).once(ERROR_EVENT, reject) // @todo test this
    .once(FINISH_EVENT, () => resolve(parser.document));
    input.setEncoding("utf8").pipe(parser);
  } else if ((0, _isString.default)(input)) {
    resolve((0, _parse.parse)(input, OPTIONS));
  } else {
    reject(new TypeError("Invalid input"));
  }
});
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=parseHTML.js.map