"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Link = require("../Link");
var _promises = require("fs/promises");
/**
 * Check a link on the local file system.
 * @param {Link} link
 * @returns {Promise<Link>}
 */
var _default = async link => {
  try {
    const {
      isDirectory
    } = await (0, _promises.stat)(link.get(_Link.REBASED_URL).pathname);
    if (isDirectory()) {
      link.exclude("BLC_DIRECTORY");
    } else {
      link.mend();
    }
  }
  // @todo possible that a `Link` method could fail; then set BLC_UNKNOWN ?
  catch ({
    code
  }) {
    link.break(`ERRNO_${code}`);
  }
  return link;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=checkLink.js.map