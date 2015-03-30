"use strict";
var resolveUrl = require("./resolveUrl");

var urllib = require("lib");



function linkObj(url)
{
	return {
		url:
		{
			original: (typeof url === "string") ? url : null,
			resolved: null,
			redirected: null,
			
			// temp keys
			parsed: null
		},
		
		base:
		{
			original: null,
			resolved: null,
			
			// temp keys
			parsed: null
		},
		
		html:
		{
			index: null,
			selector: null,
			tagName: null,
			attrName: null,
			attrs: null,
			text: null,
			tag: null,
			
			// temp keys
			attrMap: null,
			base: null,
			selfClosing: null,
			voidElement: null
		},
		
		http:
		{
			statusCode: null,
			redirects: null,
			response: null
		},
		
		broken: null,
		internal: null,
		samePage: null,
		error: null
	};
}



// TODO :: this is not linkObj
linkObj.areInternal = function(url1, url2)
{
	return url1.protocol===url2.protocol &&
	       url1.auth===url2.auth &&
	       url1.host===url2.host &&
	       url1.port===url2.port;
};



// TODO :: this is not linkObj
linkObj.areSamePage = function(url1, url2, internalOverride)
{
	var isInternal = internalOverride===undefined ? linkObj.areInternal(url1,url2) : internalOverride;
	
	return isInternal &&
	       url1.path===url2.path &&
	       url1.query===url2.query;
};



linkObj.clean = function(link)
{
	// No further need for array syntax
	link.html.attrs = link.html.attrMap;
	
	delete link.base.parsed;
	delete link.html.attrMap;
	delete link.html.base;
	delete link.html.selfClosing;
	delete link.html.voidElement;
	delete link.url.parsed;
};



linkObj.resolve = function(link, base, options)
{
	// If already resolved
	if (link.url.resolved !== null) return;
	
	var resolvedBase = urllib.resolve(base || "", link.html.base || "");
	var resolvedUrl = resolveUrl(link.url.original, resolvedBase, options.acceptedSchemes);
	
	if (base !== undefined)    link.base.original = base;
	if (resolvedBase !== "")   link.base.resolved = resolvedBase;
	if (resolvedUrl !== false) link.url.resolved = resolvedUrl;
	
	link.base.parsed = urllib.parse(link.base.resolved || link.base.original || "");
	link.url.parsed  = urllib.parse(link.url.resolved  || link.url.original);
	
	// Remove trailing ":"
	link.url.parsed.protocolTruncated = (link.url.parsed.protocol===null) ? null : link.url.parsed.protocol.slice(0,-1);
	
	if (link.url.resolved!==null && link.base.resolved!==null)
	{
		link.internal = linkObj.areInternal(link.url.parsed, link.base.parsed);
		link.samePage = linkObj.areSamePage(link.url.parsed, link.base.parsed, link.internal);
	}
};




module.exports = linkObj;
