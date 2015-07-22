"use strict";
var callHandler = require("./callHandler");
var linkObj     = require("./linkObj");

var bhttp = require("bhttp");



/*
	Checks a URL to see if it's broken or not.
*/
function checkUrl(link, baseUrl, options, cache, callback)
{
	if (typeof link==="string" || link instanceof String === true)
	{
		link = linkObj(link);
		linkObj.resolve(link, baseUrl, options);
	}
	
	if (link.url.resolved === null)
	{
		linkObj.broken(link);
		linkObj.clean(link);
		callHandler.async(callback, link);
		return;
	}

	if ( cache !== undefined && cache !== null )
	{
		if (cache.contains(link.url.resolved) === true)
		{
			cache.retrieve(link.url.resolved)(callback);
			return;
		}

		if (cache.isRetrieving(link.url.resolved) === true)
		{
			cache.addCallback(link.url.resolved, callback);
			return;
		} else {
			cache.startRetrieving(link.url.resolved);
		}
	}
	
	// Only requests header -- any body content is not downloaded
	bhttp.request(link.url.resolved,  // TODO :: https://github.com/joepie91/node-bhttp/issues/3
	{
		headers: { "user-agent":options.userAgent },
		method: "head"
	},
	function(error, response)
	{
		var execution,redirectedUrl;
		
		if (error !== null)
		{
			linkObj.broken(link, error);
			execution = "async";
		}
		else
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
					linkObj.relation(link, redirectedUrl);
				}
			}
			
			execution = "sync";
		}
		
		linkObj.clean(link);

		if ( cache !== undefined && cache !== null )
		{
			cache.store(link.url.resolved, function(cacheCallback)
            {
				callHandler[execution](cacheCallback, link);
			});
		}

		callHandler[execution](callback, link);
	});
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
