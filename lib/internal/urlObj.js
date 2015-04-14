"use strict";
var path = require("path");
var url = require("url");



function areInternal(url1, url2)
{
	// If no protocols, it's impossible to determine if they link to the same server
	if (url1.protocol===null || url2.protocol===null)
	{
		return null;
	}
	
	return url1.protocol===url2.protocol &&
	       url1.auth===url2.auth &&
	       url1.host===url2.host &&
	       url1.port===url2.port;
}



function areSamePage(url1, url2, internalOverride)
{
	var isInternal = internalOverride===undefined ? areInternal(url1,url2) : internalOverride;
	
	// If internal could not be determined, than neither can same page
	if (isInternal === null)
	{
		return null;
	}
	
	return isInternal===true &&
	       url1.path===url2.path &&
	       url1.query===url2.query;
}



function resolve(from, to/*, defaultPorts*/)
{
	// TODO :: detect if `parseQueryString` was used in any non-strings
	if (typeof from==="string" || from instanceof String) from = url.parse(from);
	if (typeof to==="string"   || to instanceof String)   to   = url.parse(to);
	
	if (from.protocol!==to.protocol && from.protocol!==null && to.protocol!==null) return to;
	if (from.auth!==to.auth         && from.auth!==null     && to.auth!==null) return to;
	if (from.host!==to.host         && from.host!==null     && to.host!==null) return to;
	
	var resolved = 
	{
		protocol: to.protocol || from.protocol,
		slashes:  to.slashes  || from.slashes,
		auth:     to.auth     || from.auth,
		host:     to.host     || from.host,
		port:     to.port     || from.port,
		hostname: to.hostname || from.hostname,
		hash: null,
		search: null,
		query: null,
		pathname: null,
		path: null,
		href: null
	};
	
	resolved.pathname = path.resolve(from.pathname || "", to.pathname || "") || null;
	
	// TODO :: Normalize before resolve (and use as arg) -- if it's faster
	var from_pathname_normalized = path.normalize(from.pathname || "") || null;
	
	if (resolved.pathname === from_pathname_normalized)
	{
		resolved.query  = to.query  || from.query;
		resolved.search = to.search || from.search;
	}
	else
	{
		resolved.query  = to.query;
		resolved.search = to.search;
	}
	
	resolved.hash = to.hash;
	resolved.path = (resolved.pathname || "") + (resolved.search || "") + (resolved.hash || "");
	resolved.path = resolved.path || null;
	resolved.href = url.format(resolved);
	
	return resolved;
}



//console.log( resolve("http://google.com?query", "#hash") );



module.exports = 
{
	areInternal: areInternal,
	areSamePage: areSamePage,
	resolve: resolve
};
