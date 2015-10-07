"use strict";
var linkObj = require("./linkObj");

var bhttp = require("bhttp");



/*
	Checks a URL to see if it's broken or not.
*/
function checkUrl(link, baseUrl, cache, options)
{
	var cached;
	
	if (typeof link==="string" || link instanceof String===true)
	{
		link = linkObj(link);
		linkObj.resolve(link, baseUrl, options);
	}
	
	if (link.url.resolved === null)
	{
		linkObj.broken(link);
		linkObj.clean(link);
		return Promise.resolve(link);
	}
	
	cached = cache.get(link.url.parsed);
	
	if (cached !== undefined)
	{
		return Promise.resolve(cached).then( function(response)
		{
			copyResponseData(response, link, options);
			
			link.http.cached = true;
			
			return link;
		});
	}
	else
	{
		var request = bhttp.request(link.url.resolved,  // TODO :: https://github.com/joepie91/node-bhttp/issues/3
		{
			headers: { "user-agent":options.userAgent },
			method: options.requestMethod
		})
		.catch( function(error)
		{
			// The error will be stored as a response
			return error;
		});
		
		// Send response to cache -- it will be available to `cache.get()` before being resolved
		if (options.cacheResponses === true)
		{
			cache.set(link.url.parsed, request);  // TODO :: `request` has a lot of baggage in memory
		}
		
		// Send linkObj to caller
		return request.then( function(response)
		{
			copyResponseData(response, link, options);
			
			link.http.cached = false;
			
			// Output order is preserved by running after the callback
			// ^ IS IT NOW?
			if (options.cacheResponses===true && link.url.redirected!=null)  // TODO :: use `!==null` ?
			{
				cache.set(link.url.redirected, response);  // TODO :: store `request` instead to be consistent?
			}
			
			return link;
		});
	}
}



/*
	Copy data from a bhttp response object—either from a request or cache—
	into a link object.
*/
function copyResponseData(response, link, options)
{
	if (response instanceof Error === false)
	{
		link.broken = response.statusCode !== 200;
		
		link.http.redirects = parseRedirects(response.redirectHistory);
		link.http.statusCode = response.statusCode;
		
		if (options.excludeResponseData !== true)
		{
			link.http.response = response;
		}
		
		if (link.url.resolved !== response.request.url)
		{
			link.url.redirected = response.request.url;
			
			if (link.base.resolved !== null)
			{
				// TODO :: this needs a test
				linkObj.relation(link, link.url.redirected);
			}
		}
	}
	else
	{
		linkObj.broken(link, response);
	}
	
	linkObj.clean(link);
}



/*
	Turns:
	
	[ { statusCode:302, request:{url:"http://domain1.com/",…}, … },
	  { statusCode:301, request:{url:"http://domain2.com/",…}, … } ]
	
	Into:
	
	[ { statusCode:302, url:"http://domain1.com/" },
	  { statusCode:301, url:"http://domain2.com/" } ]
*/
function parseRedirects(redirects)
{
	var i;
	var numRedirects = redirects.length;
	var result = [];
	
	for (i=0; i<numRedirects; i++)
	{
		result.push(
		{
			statusCode: redirects[i].statusCode,
			url:        redirects[i].request.url
		});
	}
	
	return result;
}



module.exports = checkUrl;
