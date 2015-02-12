"use strict";
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
	
	// TODO :: what if url.resolved is not null but base.resolved is?
	if (link.url.resolved!==null && link.base.resolved!==null)
	{
		resolvedBase = urllib.parse(resolvedBase);
		resolvedUrl  = urllib.parse(resolvedUrl);
		
		link.internal = resolvedUrl.protocol===resolvedBase.protocol &&
		                resolvedUrl.auth===resolvedBase.auth &&
		                resolvedUrl.host===resolvedBase.host &&
		                resolvedUrl.port===resolvedBase.port;
		
		link.samePage = link.internal &&
		                resolvedUrl.path===resolvedBase.path &&
		                resolvedUrl.query===resolvedBase.query;
		
		link.url.parsed = resolvedUrl;
	}
	else
	{
		// No other data to work with in this case
		link.samePage = link.url.original==="" || link.url.original==="." || link.url.original==="./" || link.url.original[0]==="#";
		
		link.url.parsed = urllib.parse(link.url.original);
	}
	
	link.url.parsed.protocolTruncated = (link.url.parsed.protocol===null) ? null : link.url.parsed.protocol.slice(0,-1);
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
