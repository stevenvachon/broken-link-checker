"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _events = require("../internal/events");
var _HtmlChecker = _interopRequireDefault(require("./HtmlChecker"));
var _parseOptions = _interopRequireDefault(require("../internal/parseOptions"));
var _limitedRequestQueue = _interopRequireWildcard(require("limited-request-queue"));
var _robotDirectives = _interopRequireDefault(require("robot-directives"));
var _SafeEventEmitter = _interopRequireDefault(require("../internal/SafeEventEmitter"));
var _streamHTML = _interopRequireDefault(require("../internal/streamHTML"));
var _httpProtocol = require("../internal/http-protocol");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }
function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }
var _currentAuth = /*#__PURE__*/new WeakMap();
var _currentCustomData = /*#__PURE__*/new WeakMap();
var _currentDone = /*#__PURE__*/new WeakMap();
var _currentPageURL = /*#__PURE__*/new WeakMap();
var _currentResponse = /*#__PURE__*/new WeakMap();
var _currentRobots = /*#__PURE__*/new WeakMap();
var _htmlChecker = /*#__PURE__*/new WeakMap();
var _htmlUrlQueue = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _appendRobotHeaders = /*#__PURE__*/new WeakSet();
var _completedPage = /*#__PURE__*/new WeakSet();
var _reset = /*#__PURE__*/new WeakSet();
class HtmlUrlChecker extends _SafeEventEmitter.default {
  constructor(options) {
    super();
    _classPrivateMethodInitSpec(this, _reset);
    /**
     * Emit PAGE_EVENT and continue the queue.
     * @param {Error} [error]
     */
    _classPrivateMethodInitSpec(this, _completedPage);
    /**
     * Append any robot headers.
     */
    _classPrivateMethodInitSpec(this, _appendRobotHeaders);
    _classPrivateFieldInitSpec(this, _currentAuth, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _currentCustomData, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _currentDone, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _currentPageURL, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _currentResponse, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _currentRobots, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _htmlChecker, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _htmlUrlQueue, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _options, {
      writable: true,
      value: void 0
    });
    _classPrivateMethodGet(this, _reset, _reset2).call(this);
    _classPrivateFieldSet(this, _options, (0, _parseOptions.default)(options));
    _classPrivateFieldSet(this, _htmlUrlQueue, new _limitedRequestQueue.default({
      maxSockets: 1,
      rateLimit: _classPrivateFieldGet(this, _options).rateLimit
    }).on(_limitedRequestQueue.ITEM_EVENT, async (url, {
      auth,
      customData
    }, done) => {
      _classPrivateMethodGet(this, _reset, _reset2).call(this);
      _classPrivateFieldSet(this, _currentAuth, auth);
      _classPrivateFieldSet(this, _currentCustomData, customData);
      _classPrivateFieldSet(this, _currentDone, done);
      _classPrivateFieldSet(this, _currentPageURL, url); // @todo remove hash ?

      try {
        const {
          response,
          stream
        } = await (0, _streamHTML.default)(_classPrivateFieldGet(this, _currentPageURL), _classPrivateFieldGet(this, _currentAuth), this.__cache, _classPrivateFieldGet(this, _options));

        // Is only defined for HTTP -- made null for consistency
        _classPrivateFieldSet(this, _currentResponse, response ?? null);
        _classPrivateFieldSet(this, _currentRobots, new _robotDirectives.default({
          userAgent: _classPrivateFieldGet(this, _options).userAgent
        }));
        _classPrivateMethodGet(this, _appendRobotHeaders, _appendRobotHeaders2).call(this);

        // If redirected for HTTP, or original URL for non-HTTP
        const finalPageURL = (response === null || response === void 0 ? void 0 : response.url) ?? _classPrivateFieldGet(this, _currentPageURL);

        // Passes robots instance so that headers are included in robot exclusion checks
        // @todo does the `await` cause `completedPage` to be called twice (other's in COMPLETE_EVENT) if error occurs?
        await _classPrivateFieldGet(this, _htmlChecker).scan(stream, finalPageURL, _classPrivateFieldGet(this, _currentRobots), _classPrivateFieldGet(this, _currentAuth));
      } catch (error) {
        _classPrivateMethodGet(this, _completedPage, _completedPage2).call(this, error);
      }
    }).on(_limitedRequestQueue.END_EVENT, () => {
      // Clear references for garbage collection
      _classPrivateMethodGet(this, _reset, _reset2).call(this);
      this.emit(_events.END_EVENT);
    }));
    _classPrivateFieldSet(this, _htmlChecker, new _HtmlChecker.default(_classPrivateFieldGet(this, _options)).on(_events.ERROR_EVENT, error => this.emit(_events.ERROR_EVENT, error)).on(_events.HTML_EVENT, (tree, robots) => {
      this.emit(_events.HTML_EVENT, tree, robots, _classPrivateFieldGet(this, _currentResponse), _classPrivateFieldGet(this, _currentPageURL), _classPrivateFieldGet(this, _currentCustomData));
    }).on(_events.QUEUE_EVENT, () => this.emit(_events.QUEUE_EVENT)).on(_events.JUNK_EVENT, result => this.emit(_events.JUNK_EVENT, result, _classPrivateFieldGet(this, _currentCustomData))).on(_events.LINK_EVENT, result => this.emit(_events.LINK_EVENT, result, _classPrivateFieldGet(this, _currentCustomData))).on(_events.COMPLETE_EVENT, () => _classPrivateMethodGet(this, _completedPage, _completedPage2).call(this)));
  }
  clearCache() {
    _classPrivateFieldGet(this, _htmlChecker).clearCache();
    return this;
  }
  dequeue(id) {
    const success = _classPrivateFieldGet(this, _htmlUrlQueue).dequeue(id);
    this.emit(_events.QUEUE_EVENT);
    return success;
  }

  // `auth` is undocumented and for internal use only
  enqueue(pageURL, customData, auth) {
    // @todo this could get messy if there're many different credentials per site (if we cache based on headers)
    const transitive = (0, _httpProtocol.transitiveAuth)(pageURL, auth);
    const id = _classPrivateFieldGet(this, _htmlUrlQueue).enqueue(transitive.url, {
      auth: transitive.auth,
      customData
    });
    this.emit(_events.QUEUE_EVENT);
    return id;
  }
  has(id) {
    return _classPrivateFieldGet(this, _htmlUrlQueue).has(id);
  }
  get isPaused() {
    return _classPrivateFieldGet(this, _htmlChecker).isPaused;
  }
  get numActiveLinks() {
    return _classPrivateFieldGet(this, _htmlChecker).numActiveLinks;
  }
  get numPages() {
    return _classPrivateFieldGet(this, _htmlUrlQueue).length;
  }
  get numQueuedLinks() {
    return _classPrivateFieldGet(this, _htmlChecker).numQueuedLinks;
  }
  pause() {
    _classPrivateFieldGet(this, _htmlChecker).pause();
    _classPrivateFieldGet(this, _htmlUrlQueue).pause();
    return this;
  }
  resume() {
    _classPrivateFieldGet(this, _htmlChecker).resume();
    _classPrivateFieldGet(this, _htmlUrlQueue).resume();
    return this;
  }
  get __cache() {
    return _classPrivateFieldGet(this, _htmlChecker).__cache;
  }
}
exports.default = HtmlUrlChecker;
function _appendRobotHeaders2() {
  var _classPrivateFieldGet2;
  const xRobotsTag = (_classPrivateFieldGet2 = _classPrivateFieldGet(this, _currentResponse)) === null || _classPrivateFieldGet2 === void 0 ? void 0 : _classPrivateFieldGet2.headers["x-robots-tag"];

  // @todo https://github.com/nodejs/node/issues/3591
  if (xRobotsTag != null) {
    _classPrivateFieldGet(this, _currentRobots).header(xRobotsTag);
  }
}
function _completedPage2(error = null) {
  // @todo emit page error instead?
  // @todo include redirected url if there is one?
  this.emit(_events.PAGE_EVENT, error, _classPrivateFieldGet(this, _currentPageURL), _classPrivateFieldGet(this, _currentCustomData));

  // Auto-starts next queue item, if any
  // Emits REQUEST_QUEUE_END_EVENT, if not
  _classPrivateFieldGet(this, _currentDone).call(this);
}
function _reset2() {
  _classPrivateFieldSet(this, _currentAuth, null);
  _classPrivateFieldSet(this, _currentCustomData, null);
  _classPrivateFieldSet(this, _currentDone, null);
  _classPrivateFieldSet(this, _currentPageURL, null);
  _classPrivateFieldSet(this, _currentResponse, null);
  _classPrivateFieldSet(this, _currentRobots, null);
}
module.exports = exports.default;
//# sourceMappingURL=HtmlUrlChecker.js.map