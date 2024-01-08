"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fs = require("fs");
var _errors = require("./errors");
var _path = require("path");
var _errors2 = require("../errors");
const FILE_EXTENSIONS = [".htm", ".html", ".xht", ".xhtml"];
const ERROR_EVENT = "error";
const OPEN_EVENT = "open";

/**
 * Read a file URL for its HTML contents.
 * @param {URL} url
 * @throws {ExpectedHTMLExtensionError} if not HTML media type
 * @throws {HTMLRetrievalError} file not found, etc
 * @returns {Promise<Stream>}
 * @todo return {response, stream} structure to be consistent with HTTP, and thereby support other protocols?
 */
var _default = url => new Promise((resolve, reject) => {
  const pathFileExtension = (0, _path.extname)(url.pathname);
  if (!FILE_EXTENSIONS.some(ext => pathFileExtension === ext)) {
    throw new _errors.ExpectedHTMLExtensionError(pathFileExtension);
  } else {
    const stream = (0, _fs.createReadStream)(url);
    stream.on(ERROR_EVENT, ({
      code
    }) => reject(new _errors2.HTMLRetrievalError(code)));
    stream.on(OPEN_EVENT, () => resolve(stream));
  }
});
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=streamHTML.js.map