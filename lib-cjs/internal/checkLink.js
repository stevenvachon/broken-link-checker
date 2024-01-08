"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var reasons = _interopRequireWildcard(require("./reasons"));
var _fileProtocol = require("./file-protocol");
var _httpProtocol = require("./http-protocol");
var _isString = _interopRequireDefault(require("is-string"));
var _Link = _interopRequireWildcard(require("./Link"));
var _matchURL = _interopRequireDefault(require("./matchURL"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Check a link's URL to see if it is broken or not.
 * @param {Link} link
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {TypeError} non-Link
 * @returns {Promise<Link>}
 */
var _default = async (link, auth, cache, options) => {
  if (!(link instanceof _Link.default)) {
    throw new TypeError("Invalid Link");
  } else {
    const {
      excludedKeywords,
      includedKeywords,
      includeLink
    } = options;
    const rebasedURL = link.get(_Link.REBASED_URL);
    if (rebasedURL === null) {
      link.break("BLC_INVALID");
      return link;
    } else if (!(0, _fileProtocol.isCompatibleScheme)(rebasedURL) && !(0, _httpProtocol.isCompatibleScheme)(rebasedURL)) {
      link.exclude("BLC_UNSUPPORTED");
      return link;
    } else if ((0, _matchURL.default)(rebasedURL.href, excludedKeywords)) {
      link.exclude("BLC_KEYWORD");
      return link;
    } else if (includedKeywords.length > 0 && !(0, _matchURL.default)(rebasedURL.href, includedKeywords)) {
      link.exclude("BLC_KEYWORD");
      return link;
    } else {
      const filterResult = includeLink(link);

      // Undocumented support for strings (from `SiteChecker`)
      if ((0, _isString.default)(filterResult) && filterResult in reasons) {
        link.exclude(filterResult);
        return link;
      } else if (!filterResult) {
        link.exclude("BLC_CUSTOM");
        return link;
      } else {
        if ((0, _fileProtocol.isCompatibleScheme)(rebasedURL)) {
          return (0, _fileProtocol.checkLink)(link);
        } else if ((0, _httpProtocol.isCompatibleScheme)(rebasedURL)) {
          return (0, _httpProtocol.checkLink)(link, auth, cache, options);
        }
      }
    }
  }
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=checkLink.js.map