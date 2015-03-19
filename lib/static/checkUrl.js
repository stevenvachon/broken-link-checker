"use strict";
var callHandler     = require("../common/callHandler");
var invalidUrlError = require("../common/invalidUrlError");
var linkObj         = require("../common/linkObj");



function checkUrl(link, base, options, callback)
{
	if (typeof link === "string") link = linkObj(link);
	
	linkObj.resolve(link, base, options);
	
	if (link.url.resolved === null)
	{
		link.broken = true;
		link.error = invalidUrlError();
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
			link.broken = true;
			link.error = invalidUrlError(error);
			execution = "async";
		}
		else
		{
			link.broken = response.statusCode !== 200;
			
			link.http.redirects  = response.request.redirects;
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
					link.internal = linkObj.areInternal(link.base.parsed, response.request.uri);
					link.samePage = linkObj.areSamePage(link.base.parsed, response.request.uri, link.internal);
				}
			}
			
			execution = "sync";
		}
		
		linkObj.clean(link);
		callHandler[execution](callback, link);
	});
}



module.exports = checkUrl;
