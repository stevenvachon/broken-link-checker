"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  reasons: true,
  DEFAULT_OPTIONS: true,
  HtmlChecker: true,
  HtmlUrlChecker: true,
  SiteChecker: true,
  UrlChecker: true
};
Object.defineProperty(exports, "DEFAULT_OPTIONS", {
  enumerable: true,
  get: function () {
    return _defaultOptions.default;
  }
});
Object.defineProperty(exports, "HtmlChecker", {
  enumerable: true,
  get: function () {
    return _HtmlChecker.default;
  }
});
Object.defineProperty(exports, "HtmlUrlChecker", {
  enumerable: true,
  get: function () {
    return _HtmlUrlChecker.default;
  }
});
Object.defineProperty(exports, "SiteChecker", {
  enumerable: true,
  get: function () {
    return _SiteChecker.default;
  }
});
Object.defineProperty(exports, "UrlChecker", {
  enumerable: true,
  get: function () {
    return _UrlChecker.default;
  }
});
exports.reasons = void 0;
var _events = require("./internal/events");
Object.keys(_events).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _events[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _events[key];
    }
  });
});
var _reasons = _interopRequireWildcard(require("./internal/reasons"));
exports.reasons = _reasons;
var _defaultOptions = _interopRequireDefault(require("./internal/defaultOptions"));
var _HtmlChecker = _interopRequireDefault(require("./public/HtmlChecker"));
var _HtmlUrlChecker = _interopRequireDefault(require("./public/HtmlUrlChecker"));
var _SiteChecker = _interopRequireDefault(require("./public/SiteChecker"));
var _UrlChecker = _interopRequireDefault(require("./public/UrlChecker"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
//# sourceMappingURL=index.js.map