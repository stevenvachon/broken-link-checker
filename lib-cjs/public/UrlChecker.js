"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _checkLink = _interopRequireDefault(require("../internal/checkLink"));
var _events = require("../internal/events");
var _isurl = _interopRequireDefault(require("isurl"));
var _Link = _interopRequireWildcard(require("../internal/Link"));
var _parseOptions = _interopRequireDefault(require("../internal/parseOptions"));
var _limitedRequestQueue = _interopRequireWildcard(require("limited-request-queue"));
var _SafeEventEmitter = _interopRequireDefault(require("../internal/SafeEventEmitter"));
var _urlcache = _interopRequireDefault(require("urlcache"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class UrlChecker extends _SafeEventEmitter.default {
  #cache;
  #linkQueue;
  constructor(options) {
    super();
    options = (0, _parseOptions.default)(options);
    this.#cache = new _urlcache.default({
      maxAge: options.cacheMaxAge
    });
    this.#linkQueue = new _limitedRequestQueue.default({
      maxSockets: options.maxSockets,
      maxSocketsPerHost: options.maxSocketsPerHost,
      rateLimit: options.rateLimit
    }).on(_limitedRequestQueue.ITEM_EVENT, async (url, {
      auth,
      customData,
      link
    }, done) => {
      const result = await (0, _checkLink.default)(link, auth, this.#cache, options);
      if (result.get(_Link.WAS_EXCLUDED)) {
        this.emit(_events.JUNK_EVENT, result, customData);
      } else {
        this.emit(_events.LINK_EVENT, result, customData);
      }

      // Auto-starts next queue item, if any
      // Emits REQUEST_QUEUE_END_EVENT, if not
      done();
    }).on(_limitedRequestQueue.END_EVENT, () => this.emit(_events.END_EVENT));
  }
  clearCache() {
    this.#cache.clear();
    return this;
  }
  dequeue(id) {
    const success = this.#linkQueue.dequeue(id);
    this.emit(_events.QUEUE_EVENT);
    return success;
  }

  // `auth` is undocumented and for internal use only
  enqueue(url, customData, auth = {}) {
    let link;

    // Undocumented internal use: `enqueue(Link)`
    if (url instanceof _Link.default) {
      link = url;
    }
    // Documented use: `enqueue(URL)`
    else if ((0, _isurl.default)(url)) {
      link = new _Link.default().resolve(url);
    } else {
      throw new TypeError("Invalid URL");
    }
    const id = this.#linkQueue.enqueue(link.get(_Link.REBASED_URL), {
      auth,
      customData,
      link
    });
    this.emit(_events.QUEUE_EVENT);
    return id;
  }
  has(id) {
    return this.#linkQueue.has(id);
  }
  get isPaused() {
    return this.#linkQueue.isPaused;
  }
  get numActiveLinks() {
    return this.#linkQueue.numActive;
  }
  get numQueuedLinks() {
    return this.#linkQueue.numQueued;
  }
  pause() {
    this.#linkQueue.pause();
    return this;
  }
  resume() {
    this.#linkQueue.resume();
    return this;
  }
  get __cache() {
    return this.#cache;
  }
}
exports.default = UrlChecker;
module.exports = exports.default;
//# sourceMappingURL=UrlChecker.js.map