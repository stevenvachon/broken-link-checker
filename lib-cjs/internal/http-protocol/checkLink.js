"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lodash = require("lodash");
var _Link = require("../Link");
var _request = _interopRequireDefault(require("./request"));
var _urlRelation = _interopRequireDefault(require("url-relation"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Copy data from a cached or uncached response into a Link.
 * @param {object|Error} response
 * @param {Link} link
 * @param {object} options
 */
const copyResponseData = (response, link, {
  cacheResponses
}) => {
  const {
    code,
    status,
    url
  } = response;
  if (response instanceof Error) {
    link.break(`ERRNO_${code}`);
  } else {
    if (status < 200 || status > 299) {
      link.break(`HTTP_${status}`);
    } else {
      link.mend();
    }

    // @todo would a string check be sufficient?
    if (!_urlRelation.default.match(url, link.get(_Link.REBASED_URL), {
      targetComponent: _urlRelation.default.PATH
    })) {
      // @todo this needs a test
      // @todo test if redirected to a different protocol
      link.redirect(url);
    }
    if (cacheResponses) {
      // Avoid potential mutations to cache
      response = (0, _lodash.cloneDeep)(response);
    }
    link.set(_Link.HTTP_RESPONSE, response);
  }
};

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
  const {
    cacheResponses,
    requestMethod
  } = options;
  if (cacheResponses) {
    const result = cache.get(link.get(_Link.REBASED_URL));
    if (result !== undefined) {
      copyResponseData(await result, link, options);
      link.set(_Link.HTTP_RESPONSE_WAS_CACHED, true);
    }
  }
  if (link.get(_Link.HTTP_RESPONSE_WAS_CACHED) === null) {
    const result = await (0, _request.default)(link.get(_Link.REBASED_URL), auth, requestMethod, cache, options).then(({
      response
    }) => response) // exclude any stream
    .catch(error => error);
    copyResponseData(result, link, options);
    link.set(_Link.HTTP_RESPONSE_WAS_CACHED, false);
  }
  return link;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=checkLink.js.map