"use strict";
var invalidUrlError = require("./invalidUrlError");

var bhttp = require("bhttp");



function checkErrors(response)
{
	var error,type;
	
	if (response.statusCode !== 200)
	{
		error = new Error("HTML could not be retrieved");
		error.code = response.statusCode;
		throw error;
	}
	
	type = response.headers["content-type"];
	
	// content-type is not mandatory in HTTP spec
	if (type==null || type.indexOf("text/html")!==0)
	{
		error  = 'expected type "text/html" but got ';
		error += type==null ? type : '"'+type+'"';
		
		error = new Error(error);
		error.code = response.statusCode;
		throw error;
	}
}



/*
	Request a URL for its HTML contents.
*/
function getHtmlFromUrl(url, cache, options)
{
	var htmlString,responseUrl;
	
	var request = bhttp.get(url,  // TODO :: https://github.com/joepie91/node-bhttp/issues/3
	{
		headers: { "user-agent":options.userAgent }
	})
	.then( function(response)
	{
		checkErrors(response);
		
		responseUrl = response.request.url;
		htmlString = response.body.toString();
		
		if (options.cacheResponses === true)
		{
			if (options.excludeResponseData===true && Buffer.isBuffer(response.body)===true)
			{
				// Empty the body to decrease memory usage
				// bhttp uses an empty Array instead of a Buffer in this case
				response.body = [];
			}
			
			if (responseUrl !== url)
			{
				// Will always overwrite previous value
				cache.set(responseUrl, response);  // TODO :: store `request` instead to be consistent?
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
		cache.set(url, request);  // TODO :: `request` has a lot of baggage in memory
	}
	
	// Send data to caller
	return request.then( function(result)
	{
		if (result instanceof Error) throw result;
		
		return { html:htmlString, url:responseUrl };
	});
}



module.exports = getHtmlFromUrl;
