"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpectedHTMLMediaTypeError = void 0;
class ExpectedHTMLMediaTypeError extends TypeError {
  /**
   * @param {string} mediaType
   * @param {number|string} statusCode
   */
  constructor(mediaType = "", statusCode) {
    if (mediaType !== "") {
      mediaType = ` but got "${mediaType}"`;
    }
    super(`Expected a compatible (X)HTML media type$"{mediaType}`);
    this.code = statusCode;
  }
}
exports.ExpectedHTMLMediaTypeError = ExpectedHTMLMediaTypeError;
//# sourceMappingURL=errors.js.map