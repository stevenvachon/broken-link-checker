"use strict";
var invalidUrlError = require("./invalidUrlError");
var urlObj          = require("./urlObj");

var urllib = require("url");
var urlobj = require("urlobj");



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
	delete link.html.base;  // TODO :: don't clean this? just set to null if it'd been set to undefined?
	delete link.html.selfClosing;
	delete link.html.voidElement;
	delete link.url.parsed;
	
	return link;
};



linkObj.resolve_new = function(link, base, options)
{
	// If already resolved
	if (link.url.resolved !== null) return;
	
	console.log("url:      "+link.url.original);
	console.log("base:     "+base);
	console.log("htmlbase: "+link.html.base);
	
	
	
	var base_parsed     = urlobj.normalize( urlobj.parse(base || "") );
	var htmlBase_parsed = urlobj.normalize( urlobj.parse(link.html.base || "") );
	
	// TODO :: options.normalize=false
	// TODO :: options.clone=true ?
	var resolvedBase_parsed = urlobj.resolve(base_parsed, htmlBase_parsed);
	
	if (resolvedBase_parsed.hash !== null)
	{
		// Hashes are useless in a base
		resolvedBase_parsed.hash = null;
		resolvedBase_parsed.href = urllib.format(resolvedBase_parsed);
	}
	
	
	
	// `link.url.original` should only ever not have a value within internal tests
	var linkOrg_parsed = urlobj.parse(link.url.original || "");
	
	// `linkOrg_parsed` is cloned to avoid it being mutated
	// TODO :: options.clone=true
	var resolvedUrl_parsed = urlobj.resolve( resolvedBase_parsed, cloneObject(linkOrg_parsed) );
	
	// TODO :: check with link.url.parsed.extra.protocolTruncated and acceptedSchemes map
	var acceptedScheme = isAcceptedScheme(resolvedUrl_parsed.href, options.acceptedSchemes);
	
	
	
	if (base !== undefined)              link.base.original = base;
	if (resolvedBase_parsed.href !== "") link.base.resolved = resolvedBase_parsed.href;
	
	if (acceptedScheme === true)
	{
		link.url.resolved = resolvedUrl_parsed.href;
		link.url.parsed   = resolvedUrl_parsed;
	}
	else
	{
		link.url.parsed = linkOrg_parsed;
	}
	
	link.base.parsed = base_parsed;
	
	
	
	if (link.url.resolved!==null && link.base.resolved!==null)
	{
		// Resolved base not be used because html base could be remote
		link.internal = urlObj.areInternal(link.url.parsed, base_parsed);
		link.samePage = urlObj.areSamePage(link.url.parsed, base_parsed, link.internal);
	}
	
	
	
	return link;
};



linkObj.resolve = function(link, base, options)
{
	// If already resolved
	if (link.url.resolved !== null) return;
	
	// TODO :: manually resolve these using parsed objects -- avoids parsing more than once
	var resolvedBase = urllib.resolve(base || "", link.html.base || "");
	resolvedBase = urllib.resolve(resolvedBase, "");  // removes hashes (which are useless in a base)
	
	// `link.url.original` should only ever not have a value when testing
	var resolvedUrl  = urllib.resolve(resolvedBase, link.url.original || "");
	
	// TODO :: check with link.url.parsed.extra,protocolTruncated and acceptedSchemes map
	var acceptedScheme = isAcceptedScheme(resolvedUrl, options.acceptedSchemes);
	
	if (base !== undefined)      link.base.original = base;
	if (resolvedBase !== "")     link.base.resolved = resolvedBase;
	if (acceptedScheme === true) link.url.resolved = resolvedUrl;
	
	link.base.parsed = urllib.parse(link.base.resolved /*|| link.base.original*/ || "");
	link.url.parsed  = urllib.parse(link.url.resolved  || link.url.original || "");
	
	// Remove trailing ":"
	link.url.parsed.extra = {};  // consistent with urlobj
	link.url.parsed.extra.protocolTruncated = (link.url.parsed.protocol===null) ? null : link.url.parsed.protocol.slice(0,-1);
	
	if (link.url.resolved!==null && link.base.resolved!==null)
	{
		// TODO :: internal/samePage should not be based on htmlbase because it could be remote
		link.internal = urlObj.areInternal(link.url.parsed, link.base.parsed);
		link.samePage = urlObj.areSamePage(link.url.parsed, link.base.parsed, link.internal);
	}
	
	return link;
};



//::: PRIVATE FUNCTIONS



function cloneObject(source)
{
	var key,value;
	var clone = Object.create(source);
	
	for (key in source)
	{
		if (source.hasOwnProperty(key) === true)
		{
			value = source[key];
			
			if (value!==null && typeof value==="object")
			{
				clone[key] = cloneObject(value);
			}
			else
			{
				clone[key] = value;
			}
		}
	}
	
	return clone;
}



function isAcceptedScheme(url, acceptedSchemes)
{
	for (var scheme in acceptedSchemes)
	{
		if (acceptedSchemes.hasOwnProperty(scheme) === true)
		{
			scheme += ":";
			
			if ( scheme === url.substring(0,scheme.length) )
			{
				return true;
			}
		}
	}
	
	return false;
}



module.exports = linkObj;
