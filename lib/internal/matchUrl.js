"use strict";
const calmcard = require("calmcard");  // TODO :: use npmjs.com/matcher or npmjs.com/minimatch



function matchUrl(url, keywords)
{
	const numKeywords = keywords.length;

	for (let i=0; i<numKeywords; i++)
	{
		// Check for literal keyword
		if (url.includes(keywords[i]))
		{
			return true;
		}
		// Check for glob'bed keyword
		else if (calmcard(keywords[i], url))
		{
			return true;
		}
	}

	return false;
}



module.exports = matchUrl;
