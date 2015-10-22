"use strict";
var invalidUrlError = require("./invalidUrlError");
var simpleResponse  = require("./simpleResponse");

var bhttp = require("bhttp");



function checkErrors(response)
{
	var error,type;
	
	if (response.statusCode !== 200)
	{
		error = new Error("HTML could not be retrieved");
		error.code = response.statusCode;
		return error;
	}
	
	type = response.headers["content-type"];
	
	// content-type is not mandatory in HTTP spec
	if (type==null || type.indexOf("text/html")!==0)
	{
		error  = 'expected type "text/html" but got ';
		error += type==null ? type : '"'+type+'"';
		
		error = new Error(error);
		error.code = response.statusCode;
		return error;
	}
}



/*
	Request a URL for its HTML contents.
*/
function streamHtml(url, cache, options)
{
	var result;
	
	// Always gets the URL because response bodies are never cached
	var request = bhttp.get(url,  // TODO :: https://github.com/joepie91/node-bhttp/issues/3
	{
		discardResponse: true,
		headers: { "user-agent":options.userAgent },
		stream: true
	})
	.then( function(orgResponse)
	{
		var response = simpleResponse(orgResponse);
		
		result = checkErrors(response);
		
		if (result === undefined)
		{
			result = 
			{
				response: response,
				stream: orgResponse
			};
			
			// Send response of redirected url to cache
			if (options.cacheResponses===true && response.url!==url)
			{
				// Will always overwrite previous value
				cache.set(response.url, response);  // TODO :: store `request` instead to be consistent?
			}
		}
		
		return response;
	})
	.catch( function(error)
	{
		// The error will be stored as a response
		return invalidUrlError(error);
	});
	
	// Send response to cache -- it will be available to `cache.get()` before being resolved
	if (options.cacheResponses === true)
	{
		// Will always overwrite previous value
		cache.set(url, request);
	}
	
	// Send result to caller
	return request.then( function(response)
	{
		if (response instanceof Error === true) throw response;
		if (result instanceof Error === true) throw result;
		
		return result;
	});
}



module.exports = streamHtml;
