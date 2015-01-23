"use strict";
var cleanUrl = require("url").resolve;



function resolveUrl(url, options)
{
	// Incompatible URL
	if (typeof url !== "string") return false;
	
	// Will convert a relative URL to absolute
	// Will clean up slashes
	url = cleanUrl(options.site || "", url);
	
	// Accepted absolute URL schemes
	for (var i=0; i<options.acceptedSchemes.length; i++)
	{
		var scheme = options.acceptedSchemes[i] + ":";
		
		if ( scheme === url.substring(0,scheme.length) )
		{
			return url;
		}
	}
	
	// Incompatible URL
	return false;
}



module.exports = resolveUrl;
