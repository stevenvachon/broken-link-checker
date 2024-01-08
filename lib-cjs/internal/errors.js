"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ExpectedHTMLExtensionError", {
  enumerable: true,
  get: function () {
    return _fileProtocol.ExpectedHTMLExtensionError;
  }
});
Object.defineProperty(exports, "ExpectedHTMLMediaTypeError", {
  enumerable: true,
  get: function () {
    return _httpProtocol.ExpectedHTMLMediaTypeError;
  }
});
exports.HTMLRetrievalError = void 0;
var _fileProtocol = require("./file-protocol");
var _httpProtocol = require("./http-protocol");
class HTMLRetrievalError extends Error {
  /**
   * @param {number|string} statusCode
   */
  constructor(statusCode) {
    super("HTML could not be retrieved");
    this.code = statusCode;
  }
}
exports.HTMLRetrievalError = HTMLRetrievalError;
//# sourceMappingURL=errors.js.map