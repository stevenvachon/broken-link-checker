const SCHEMES = ["http:", "https:"];



/**
 * Determine whether a URL supports an HTTP scheme/protocol.
 * @param {URL} url
 * @returns {boolean}
 */
export default url => SCHEMES.some(scheme => url.protocol === scheme);
