"use strict";
var invalidUrlError = require("./invalidUrlError");
var urlObj          = require("./urlObj");

var urllib = require("url");



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
		error: null,
		
		// temp keys
		broken_link_checker: true
	};
}



linkObj.broken = function(link, error)
{
	link.broken = true;
	link.error = invalidUrlError(error);
	
	return link;
};



linkObj.clean = function(link)
{
	// No further need for array syntax
	link.html.attrs = link.html.attrMap;
	
	delete link.base.parsed;
	delete link.broken_link_checker;
	delete link.html.attrMap;
	delete link.html.base;	// TODO :: don't clean this? just set to null if it'd been set to undefined?
	delete link.html.selfClosing;
	delete link.html.voidElement;
	delete link.url.parsed;
	
	return link;
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
		link.internal = urlObj.areInternal(link.url.parsed, link.base.parsed);
		link.samePage = urlObj.areSamePage(link.url.parsed, link.base.parsed, link.internal);
	}
	
	return link;
};



//::: PRIVATE FUNCTIONS



// TODO :: move urllib.resolve() into linkObj.resolve() and make this a hasAcceptedScheme()
// TODO :: switch url and base argument indexes to match urllib.resolve() ?
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



module.exports = linkObj;
