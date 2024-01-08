"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reasons = require("../reasons");
var _httpMethodsConstants = require("http-methods-constants");
var _isurl = _interopRequireDefault(require("isurl"));
var _got = require("got");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const ERROR_EVENT = "error";
const REDIRECT_EVENT = "redirect";
const RESPONSE_EVENT = "response";

/**
 * Create an HTTP request.
 * @param {URL} url
 * @param {object} auth
 * @param {string} method
 * @param {object} options
 * @param {boolean} [isRetry]
 * @returns {Promise<object>}
 */
const createRequest = (url, auth, method, options, isRetry = false) => new Promise((resolve, reject) => {
  const redirects = [];
  (0, _got.stream)(url, {
    auth: stringifyAuth(url, auth),
    headers: {
      "user-agent": options.userAgent,
      ...options.customHeaders
    },
    method,
    rejectUnauthorized: false,
    // accept self-signed SSL certificates
    retry: 0,
    throwHttpErrors: false
  }).on(ERROR_EVENT, reject)
  // @todo test http 303
  // @todo http 301/302 requests *can* have bodies, which could have links
  .on(REDIRECT_EVENT, stream => redirects.push(simplifyResponse(stream))).on(RESPONSE_EVENT, stream => {
    const response = simplifyResponse(stream, redirects);
    if (!isRetry && method === _httpMethodsConstants.HEAD && options.retryHeadFail && options.retryHeadCodes.includes(response.status)) {
      // Retry potentially broken server with GET
      resolve(createRequest(url, auth, _httpMethodsConstants.GET, options, true));
    } else if (method === _httpMethodsConstants.GET && response.status >= 200 && response.status <= 299) {
      resolve({
        response,
        stream
      });
    } else {
      resolve({
        response
      });
    }
  });
});

/**
 * Create a simple response object from that of the "http" module.
 * @param {object|Stream} response
 * @param {Array<object>} [redirects]
 * @returns {object}
 * @todo add response time -- https://github.com/sindresorhus/got/issues/874
 */
const simplifyResponse = ({
  headers,
  statusCode,
  statusMessage,
  url
}, redirects) => ({
  headers,
  status: statusCode,
  statusText: statusMessage,
  url: new URL(url),
  ...(redirects && {
    redirects
  }) // only return/destructure object if value is truthy
});

/**
 * Convert an HTTP authentication URL or object into a string.
 * @param {URL} url
 * @param {object} auth
 * @returns {string}
 */
const stringifyAuth = (url, auth) => {
  if (url.password !== "" || url.username !== "") {
    return `${url.username}:${url.password}`;
  } else if (auth.password !== "" || auth.username !== "") {
    return `${auth.username}:${auth.password}`;
  }
};

/**
 * Create an HTTP request and optionally cache the response.
 * @param {URL} url
 * @param {object} auth
 * @param {string} method
 * @param {URLCache} cache
 * @param {object} options
 * @throws {TypeError} non-URL
 * @returns {Promise<object>}
 * @todo use `Promise.try()` instead of `async`
 */
var _default = async (url, auth, method, cache, options) => {
  if (!(0, _isurl.default)(url)) {
    throw new TypeError(_reasons.BLC_INVALID);
  } else {
    const promise = createRequest(url, auth, method, options);
    if (options.cacheResponses) {
      const cachedPromise = promise.then(({
        response
      }) => {
        // Replace cached promise
        // @todo store in a "response" key, so that we can also store a list of all element IDs in the document
        cache.set(url, response);

        // Any final redirect
        // @todo store in a "response" key, so that we can also store a list of all element IDs in the document
        cache.set(response.url, response);

        // Any intermediary redirects
        response.redirects.forEach((redirect, i) => {
          const subsequentRedirects = response.redirects.slice(i + 1);

          // @todo store in a "response" key, so that we can also store a list of all element IDs in the document
          cache.set(redirect.url, {
            ...response,
            redirects: subsequentRedirects
          });
        });
        return response;
      }).catch(error => error); // pass-through

      // Make future response available to other requests before completion
      // Will always overwrite previous value
      // @todo store in a "response" key, so that we can also store a list of all element IDs in the document
      cache.set(url, cachedPromise);
    }
    return promise;
  }
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=request.js.map