import calmcard from "calmcard";  // @todo use npmjs.com/matcher or npmjs.com/minimatch



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
	// Check for glob
	else if (calmcard(keyword, url))
	{
		return true;
	}
	else
	{
		return false;
	}
});
