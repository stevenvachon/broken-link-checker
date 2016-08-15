/**
 * Determine whether a URL supports a file scheme/protocol.
 * @param {URL} url
 * @returns {boolean}
 */
export default url => url.protocol === "file:";
