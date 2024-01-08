"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _events = require("../internal/events");
var _Link = require("../internal/Link");
var _linkTypes = require("link-types");
var _parseHTML = _interopRequireDefault(require("../internal/parseHTML"));
var _parseOptions = _interopRequireDefault(require("../internal/parseOptions"));
var _robotDirectives = _interopRequireWildcard(require("robot-directives"));
var _SafeEventEmitter = _interopRequireDefault(require("../internal/SafeEventEmitter"));
var _scrapeHTML = _interopRequireDefault(require("../internal/scrapeHTML"));
var _httpProtocol = require("../internal/http-protocol");
var _UrlChecker = _interopRequireDefault(require("./UrlChecker"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }
function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }
var _auth = /*#__PURE__*/new WeakMap();
var _excludedLinks = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _resolvePromise = /*#__PURE__*/new WeakMap();
var _robots = /*#__PURE__*/new WeakMap();
var _scanning = /*#__PURE__*/new WeakMap();
var _urlChecker = /*#__PURE__*/new WeakMap();
var _complete = /*#__PURE__*/new WeakSet();
var _getExcludeReason = /*#__PURE__*/new WeakSet();
var _isExcludedAttribute = /*#__PURE__*/new WeakSet();
var _maybeEnqueueLink = /*#__PURE__*/new WeakSet();
var _reset = /*#__PURE__*/new WeakSet();
class HtmlChecker extends _SafeEventEmitter.default {
  constructor(options) {
    super();
    _classPrivateMethodInitSpec(this, _reset);
    /**
     * Enqueue a Link if it is valid and passes filters.
     * @param {Link} link
     */
    _classPrivateMethodInitSpec(this, _maybeEnqueueLink);
    /**
     * Determine whether a Link's HTML element and attribute would cause it to be excluded from checks.
     * @param {string} attrName
     * @param {Array<string>} tagNames
     * @returns {boolean}
     */
    _classPrivateMethodInitSpec(this, _isExcludedAttribute);
    /**
     * Determine whether a Link should be excluded from checks, and the reason for such.
     * @param {Link} link
     * @returns {string|undefined}
     */
    _classPrivateMethodInitSpec(this, _getExcludeReason);
    _classPrivateMethodInitSpec(this, _complete);
    _classPrivateFieldInitSpec(this, _auth, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _excludedLinks, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _options, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _resolvePromise, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _robots, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _scanning, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _urlChecker, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _options, (0, _parseOptions.default)(options));
    _classPrivateMethodGet(this, _reset, _reset2).call(this);
    _classPrivateFieldSet(this, _urlChecker, new _UrlChecker.default(_classPrivateFieldGet(this, _options)).on(_events.ERROR_EVENT, error => this.emit(_events.ERROR_EVENT, error)).on(_events.QUEUE_EVENT, () => this.emit(_events.QUEUE_EVENT)).on(_events.JUNK_EVENT, result => {
      var _this$excludedLinks, _this$excludedLinks2;
      result.set(_Link.HTML_OFFSET_INDEX, (_classPrivateFieldSet(this, _excludedLinks, (_this$excludedLinks = _classPrivateFieldGet(this, _excludedLinks), _this$excludedLinks2 = _this$excludedLinks++, _this$excludedLinks)), _this$excludedLinks2));
      this.emit(_events.JUNK_EVENT, result);
    }).on(_events.LINK_EVENT, result => this.emit(_events.LINK_EVENT, result)).on(_events.END_EVENT, () => _classPrivateMethodGet(this, _complete, _complete2).call(this)));
  }
  clearCache() {
    _classPrivateFieldGet(this, _urlChecker).clearCache();
    return this;
  }
  get isPaused() {
    return _classPrivateFieldGet(this, _urlChecker).isPaused;
  }
  get numActiveLinks() {
    return _classPrivateFieldGet(this, _urlChecker).numActiveLinks;
  }
  get numQueuedLinks() {
    return _classPrivateFieldGet(this, _urlChecker).numQueuedLinks;
  }
  pause() {
    _classPrivateFieldGet(this, _urlChecker).pause();
    return this;
  }
  resume() {
    _classPrivateFieldGet(this, _urlChecker).resume();
    return this;
  }

  // `robots` and `auth` are undocumented and for internal use only
  async scan(html, baseURL, robots, auth) {
    if (_classPrivateFieldGet(this, _scanning)) {
      // @todo use custom error (for better tests and consumer debugging) ?
      throw new Error("Scan already in progress");
    } else {
      // Prevent user error with missing undocumented arugment
      if (!(robots instanceof _robotDirectives.default)) {
        robots = new _robotDirectives.default({
          userAgent: _classPrivateFieldGet(this, _options).userAgent
        });
      }
      const transitive = (0, _httpProtocol.transitiveAuth)(baseURL, auth);
      baseURL = transitive.url; // @todo remove hash (and store somewhere?)

      _classPrivateFieldSet(this, _auth, transitive.auth);
      _classPrivateFieldSet(this, _robots, robots);
      _classPrivateFieldSet(this, _scanning, true);
      const document = await (0, _parseHTML.default)(html);
      const links = (0, _scrapeHTML.default)(document, baseURL, _classPrivateFieldGet(this, _robots)); // @todo add auth?

      this.emit(_events.HTML_EVENT, document, _classPrivateFieldGet(this, _robots));
      links.forEach(link => _classPrivateMethodGet(this, _maybeEnqueueLink, _maybeEnqueueLink2).call(this, link));
      const resolveOnComplete = new Promise(resolve => _classPrivateFieldSet(this, _resolvePromise, resolve));

      // If no links found or all links already checked
      if (_classPrivateFieldGet(this, _urlChecker).numActiveLinks === 0 && _classPrivateFieldGet(this, _urlChecker).numQueuedLinks === 0) {
        _classPrivateMethodGet(this, _complete, _complete2).call(this);
      }
      return resolveOnComplete;
    }
  }
  get __cache() {
    return _classPrivateFieldGet(this, _urlChecker).__cache;
  }
}

//::: PRIVATE FUNCTIONS
exports.default = HtmlChecker;
function _complete2() {
  const resolvePromise = _classPrivateFieldGet(this, _resolvePromise);
  _classPrivateMethodGet(this, _reset, _reset2).call(this);
  this.emit(_events.COMPLETE_EVENT);
  resolvePromise();
}
function _getExcludeReason2(link) {
  const attrName = link.get(_Link.HTML_ATTR_NAME);
  const attrs = link.get(_Link.HTML_ATTRS);
  const isInternal = link.get(_Link.IS_INTERNAL);
  const tagName = link.get(_Link.HTML_TAG_NAME);
  const {
    excludeExternalLinks,
    excludeInternalLinks,
    excludeLinksToSamePage,
    honorRobotExclusions
  } = _classPrivateFieldGet(this, _options);
  if (honorRobotExclusions && _classPrivateFieldGet(this, _robots).oneIs([_robotDirectives.NOFOLLOW, _robotDirectives.NOINDEX])) {
    return "BLC_ROBOTS";
  } else if (honorRobotExclusions && _classPrivateFieldGet(this, _robots).is(_robotDirectives.NOIMAGEINDEX) && isRobotAttr(tagName, attrName)) {
    return "BLC_ROBOTS";
  } else if (honorRobotExclusions && (attrs === null || attrs === void 0 ? void 0 : attrs.rel) != null && (0, _linkTypes.map)(attrs.rel).nofollow) {
    return "BLC_ROBOTS";
  } else if (_classPrivateMethodGet(this, _isExcludedAttribute, _isExcludedAttribute2).call(this, attrName, [tagName, "*"])) {
    return "BLC_HTML";
  } else if (excludeExternalLinks && isInternal === false) {
    return "BLC_EXTERNAL";
  } else if (excludeInternalLinks && isInternal) {
    return "BLC_INTERNAL";
  } else if (excludeLinksToSamePage && link.get(_Link.IS_SAME_PAGE)) {
    return "BLC_SAMEPAGE";
  }
}
function _isExcludedAttribute2(attrName, tagNames) {
  const tagGroups = _classPrivateFieldGet(this, _options).tags[_classPrivateFieldGet(this, _options).filterLevel];
  return tagNames.every(tagName => !(tagName in tagGroups) || !(attrName in tagGroups[tagName]));
}
function _maybeEnqueueLink2(link) {
  if (link.get(_Link.REBASED_URL) === null) {
    link.set(_Link.HTML_OFFSET_INDEX, link.get(_Link.HTML_INDEX) - _classPrivateFieldGet(this, _excludedLinks));
    link.break("BLC_INVALID");

    // Can't enqueue a non-URL
    this.emit(_events.LINK_EVENT, link);
  } else {
    const excludedReason = _classPrivateMethodGet(this, _getExcludeReason, _getExcludeReason2).call(this, link);
    if (excludedReason === undefined) {
      link.set(_Link.HTML_OFFSET_INDEX, link.get(_Link.HTML_INDEX) - _classPrivateFieldGet(this, _excludedLinks));
      _classPrivateFieldGet(this, _urlChecker).enqueue(link, null, _classPrivateFieldGet(this, _auth));
    } else {
      var _this$excludedLinks3, _this$excludedLinks4;
      link.set(_Link.HTML_OFFSET_INDEX, (_classPrivateFieldSet(this, _excludedLinks, (_this$excludedLinks3 = _classPrivateFieldGet(this, _excludedLinks), _this$excludedLinks4 = _this$excludedLinks3++, _this$excludedLinks3)), _this$excludedLinks4));
      link.exclude(excludedReason);
      this.emit(_events.JUNK_EVENT, link);
    }
  }
}
function _reset2() {
  _classPrivateFieldSet(this, _auth, null);
  _classPrivateFieldSet(this, _excludedLinks, 0);
  _classPrivateFieldSet(this, _resolvePromise, null);
  _classPrivateFieldSet(this, _robots, null);
  _classPrivateFieldSet(this, _scanning, false);
}
const isRobotAttr = (tagName, attrName) => {
  return tagName === "img" && attrName === "src" || tagName === "input" && attrName === "src" || tagName === "menuitem" && attrName === "icon" || tagName === "video" && attrName === "poster";
};
module.exports = exports.default;
//# sourceMappingURL=HtmlChecker.js.map