"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _errors = require("./errors");
var _httpMethodsConstants = require("http-methods-constants");
var _errors2 = require("../errors");
var _request = _interopRequireDefault(require("./request"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const CONTENT_TYPE = "content-type";
const HTML_MIMETYPE = "text/html";
const XHTML_MIMETYPE = "application/xhtml+xml";

/**
 * Request a URL for its HTML contents.
 * @param {URL} url
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {ExpectedHTMLMediaTypeError} if not HTML media type
 * @throws {HTMLRetrievalError} 404, etc
 * @throws {Error} if failed connection
 * @returns {Promise<object>}
 */
var _default = async (url, auth, cache, options) => {
  const result = await (0, _request.default)(url, auth, _httpMethodsConstants.GET, cache, options);
  const {
    response: {
      headers,
      status
    }
  } = result;
  if (status < 200 || status > 299) {
    throw new _errors2.HTMLRetrievalError(status);
  } else {
    const type = headers[CONTENT_TYPE];

    // Content-type is not mandatory in HTTP spec
    // Could have trailing charset
    if (!(type !== null && type !== void 0 && type.startsWith(HTML_MIMETYPE)) && !(type !== null && type !== void 0 && type.startsWith(XHTML_MIMETYPE))) {
      throw new _errors.ExpectedHTMLMediaTypeError(type, status);
    }
  }
  return result;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=streamHTML.js.map