import {isMatch} from "matcher";



/**
 * Determine if a URL contains at least one—possibly glob'bed—keyword.
 * @param {string} url
 * @param {Array<string>} keywords
 * @returns {boolean}
 */
export default (url, keywords) => keywords.some(keyword =>
{
	// Check for literal keyword
	if (url.includes(keyword))
	{
		return true;
	}
	else
	{
		// Check for glob
		return isMatch(url, keyword);
	}
});
