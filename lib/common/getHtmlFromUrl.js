"use strict";
var callHandler     = require("./callHandler");
var invalidUrlError = require("./invalidUrlError");
var resolveUrl      = require("./resolveUrl");

var request = require("request");



/*
	Request a URL for its HTML contents.
	
	If URL is redirected, `options` is duplicated and modified.
*/
function getHtmlFromUrl(url, options, callback)
{
	var resolvedUrl = resolveUrl(url, options.base, options.acceptedSchemes);
	
	if (resolvedUrl === false)
	{
		callHandler.async(callback, invalidUrlError());
		return;
	}
	
	request(
	{
		headers: { "User-Agent":options.userAgent },
		url: resolvedUrl
	},
	function(error, response)
	{
		if (error !== null)
		{
			callHandler.async(callback, invalidUrlError(error));
			return;
		}
		
		if (response.headers["content-type"].indexOf("text/html") === 0)
		{
			// If URL was redirected
			if (response.request.href !== options.base)
			{
				// Duplicate options with new base
				options = Object.create(options);
				options.base = response.request.href;
			}
			
			callHandler.sync(callback, [null, response.body, options]);
		}
		else
		{
			callHandler.sync(callback, new Error('expected type "text/html" but got "'+response.headers["content-type"]+'"'));
		}
	});
}



module.exports = getHtmlFromUrl;
