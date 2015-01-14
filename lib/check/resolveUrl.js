"use strict";
var absolutizeUrl = require("url").resolve;



function resolveUrl(url, options)
{
	if (typeof url !== "string") return false;
	//if (url.length === 0) return false;
	
	// No fragments/hashes
	if (url[0] === "#") return false;
	
	// Accepted scheme (http, https, etc)
	for (var i=0; i<options.acceptedSchemes.length; i++)
	{
		var scheme = options.acceptedSchemes[i] + ":";
		
		if ( scheme === url.substring(0,scheme.length) )
		{
			return url;
		}
	}
	
	// Can only support paths if there is a site to resolve them with
	if (typeof options.site==="string" && options.site.length>0)
	{
		return absolutizeUrl(options.site, url);
	}
	
	// Incompatible URL
	return false;
}



module.exports = resolveUrl;
