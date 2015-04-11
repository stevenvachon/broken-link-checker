"use strict";
var callHandler = require("./callHandler");
var linkObj     = require("./linkObj");
var urlObj      = require("./urlObj");

var request = require("request");



/*
	Checks a URL to see if it's broken or not.
*/
function checkUrl(link, baseUrl, options, callback)
{
	if (typeof link==="string" || link instanceof String)
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
	
	// Only requests header -- any body content is not downloaded
	request(
	{
		headers: { "User-Agent":options.userAgent },
		method: "HEAD",
		url: link.url.resolved
	},
	function(error, response)
	{
		var execution;
		
		if (error !== null)
		{
			linkObj.broken(link, error);
			execution = "async";
		}
		else
		{
			link.broken = response.statusCode !== 200;
			
			link.http.redirects  = response.request._redirect.redirects;
			link.http.statusCode = response.statusCode;
			
			if (options.excludeResponseData !== true)
			{
				link.http.response = response;
			}
			
			if (link.url.resolved !== response.request.href)
			{
				link.url.redirected = response.request.href;
				
				if (link.base.resolved !== null)
				{
					link.internal = urlObj.areInternal(link.base.parsed, response.request.uri);
					link.samePage = urlObj.areSamePage(link.base.parsed, response.request.uri, link.internal);
				}
			}
			
			execution = "sync";
		}
		
		linkObj.clean(link);
		callHandler[execution](callback, link);
	});
}



module.exports = checkUrl;
