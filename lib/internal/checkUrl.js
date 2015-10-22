"use strict";
var invalidUrlError = require("./invalidUrlError");
var linkObj         = require("./linkObj");
var simpleResponse  = require("./simpleResponse");

var bhttp = require("bhttp");
var isString = require("is-string");



/*
	Checks a URL to see if it's broken or not.
*/
function checkUrl(link, baseUrl, cache, options)
{
	var cached;
	
	if (isString(link) === true)
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
			discardResponse: true,
			headers: { "user-agent":options.userAgent },
			method: options.requestMethod
		})
		.then( function(response)
		{
			response = simpleResponse(response);
			
			// TODO :: store ALL redirected urls in cache
			if (options.cacheResponses===true && response.url!==link.url.resolved)
			{
				cache.set(response.url, response);  // TODO :: store `request` instead to be consistent?
			}
			
			return response;
		})
		.catch( function(error)
		{
			// The error will be stored as a response
			return invalidUrlError(error);  // in case we missed any checks in `linkObj.resolve()`
		});
		
		// Send response to cache -- it will be available to `cache.get()` before being resolved
		if (options.cacheResponses === true)
		{
			cache.set(link.url.parsed, request);
		}
		
		// Send linkObj to caller
		return request.then( function(response)
		{
			copyResponseData(response, link, options);
			
			link.http.cached = false;
			
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
		
		link.http.redirects = response.redirects;
		link.http.statusCode = response.statusCode;
		
		if (options.excludeResponseData !== true)
		{
			link.http.response = response;
		}
		
		if (link.url.resolved !== response.url)
		{
			link.url.redirected = response.url;
			
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



module.exports = checkUrl;
