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
	
	/*var base_parsed     = urllib.parse(base || "");
	var htmlBase_parsed = urllib.parse(link.html.base || "");
	
	var resolvedBase_parsed = urlObj.resolve(base_parsed, htmlBase_parsed);*/
	
	
	
	// TODO :: manually resolve these using parsed objects -- avoids parsing more than once
	var resolvedBase = urllib.resolve(base || "", link.html.base || "");
	resolvedBase = urllib.resolve(resolvedBase, "");	// removes hashes (which are useless in a base)
	
	// `link.url.original` should only ever not have a value when testing
	var resolvedUrl  = urllib.resolve(resolvedBase, link.url.original || "");
	
	// TODO :: convert acceptedSchemes to a map in parseOptions
	// TODO :: check with link.url.parsed.protocolTruncated and acceptedSchemes map
	var acceptedScheme = isAcceptedScheme(resolvedUrl, options.acceptedSchemes);
	
	if (base !== undefined)      link.base.original = base;
	if (resolvedBase !== "")     link.base.resolved = resolvedBase;
	if (acceptedScheme === true) link.url.resolved = resolvedUrl;
	
	link.base.parsed = urllib.parse(link.base.resolved /*|| link.base.original*/ || "");
	link.url.parsed  = urllib.parse(link.url.resolved  || link.url.original || "");
	
	// Remove trailing ":"
	link.url.parsed.protocolTruncated = (link.url.parsed.protocol===null) ? null : link.url.parsed.protocol.slice(0,-1);
	
	if (link.url.resolved!==null && link.base.resolved!==null)
	{
		// TODO :: internal/samePage should not be based on htmlbase because it could be remote
		link.internal = urlObj.areInternal(link.url.parsed, link.base.parsed);
		link.samePage = urlObj.areSamePage(link.url.parsed, link.base.parsed, link.internal);
	}
	
	return link;
};



//::: PRIVATE FUNCTIONS



function isAcceptedScheme(url, acceptedSchemes)
{
	var i,scheme;
	
	for (i=0; i<acceptedSchemes.length; i++)
	{
		scheme = acceptedSchemes[i] + ":";
		
		if ( scheme === url.substring(0,scheme.length) )
		{
			return true;
		}
	}
	
	return false;
}



module.exports = linkObj;
