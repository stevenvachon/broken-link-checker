"use strict";
var urllib = require("url");



function resolveUrl(url, base, acceptedSchemes)
{
	// If incompatible URL
	if (typeof url !== "string") return false;
	
	// Will convert a relative URL to absolute
	// Will clean up slashes
	url = urllib.resolve(base || "", url);
	
	// Accepted absolute URL schemes
	for (var i=0; i<acceptedSchemes.length; i++)
	{
		var scheme = acceptedSchemes[i] + ":";
		
		if ( scheme === url.substring(0,scheme.length) )
		{
			// Compatible URL
			return url;
		}
	}
	
	// Incompatible URL
	return false;
}



module.exports = resolveUrl;
