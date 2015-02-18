"use strict";
var relativity = require("./relativity");

var urllib = require("url");



function resolveLinkObj(link, options)
{
	// If already resolved
	if (link.url.resolved !== null) return;
	
	var resolvedBase = urllib.resolve(options.base || "", link.html.base || "");
	var resolvedUrl = resolveUrl(link.url.original, resolvedBase, options.acceptedSchemes);
	
	if (options.base !== undefined) link.base.original = options.base;
	if (resolvedBase !== "")        link.base.resolved = resolvedBase;
	if (resolvedUrl !== false)      link.url.resolved = resolvedUrl;
	
	link.base.parsed = urllib.parse(link.base.resolved || link.base.original || "");
	link.url.parsed  = urllib.parse(link.url.resolved  || link.url.original);
	
	// Remove trailing ":"
	link.url.parsed.protocolTruncated = (link.url.parsed.protocol===null) ? null : link.url.parsed.protocol.slice(0,-1);
	
	if (link.url.resolved!==null && link.base.resolved!==null)
	{
		link.internal = relativity.internal(link.url.parsed, link.base.parsed);
		link.samePage = relativity.samePage(link.url.parsed, link.base.parsed, link.internal);
	}
}



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



module.exports = 
{
	linkObj: resolveLinkObj,
	url: resolveUrl
};
