"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reasons = require("./reasons");
var _httpProtocol = require("./http-protocol");
var _isurl = _interopRequireDefault(require("isurl"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//import {isCompatibleScheme as isFileScheme, streamHTML as streamHTMLFromFile} from "./file-protocol";
/**
 * Retreive HTML contents from a URL.
 * @param {URL} url
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {ExpectedHTMLError} if not HTML media type
 * @throws {HTMLRetrievalError} 404, etc
 * @throws {TypeError} non-URL
 * @returns {Promise<object>}
 */
var _default = async (url, auth, cache, options) => {
  if (!(0, _isurl.default)(url)) {
    throw new TypeError(_reasons.BLC_INVALID);
  } else {
    /*if (isFileScheme(url))
    {
    	const stream = await streamHTMLFromFile(url);
    	return {stream};
    }
    else if (isHTTPScheme(url))
    {*/
    return (0, _httpProtocol.streamHTML)(url, auth, cache, options);
    //}
  }
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=streamHTML.js.map