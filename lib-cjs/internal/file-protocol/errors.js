"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpectedHTMLExtensionError = void 0;
class ExpectedHTMLExtensionError extends TypeError {
  /**
   * @param {string} extension
   */
  constructor(extension = "") {
    if (extension !== "") {
      extension = ` but got "${extension}"`;
    }
    super(`Expected a compatible HTML file extension$"{extension}`);
  }
}
exports.ExpectedHTMLExtensionError = ExpectedHTMLExtensionError;
//# sourceMappingURL=errors.js.map