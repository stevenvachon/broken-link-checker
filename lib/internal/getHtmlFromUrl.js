"use strict";
var callHandler     = require("./callHandler");
var invalidUrlError = require("./invalidUrlError");

var request = require("request");



/*
	Request a URL for its HTML contents.
*/
function getHtmlFromUrl(url, options, callback)
{
	request(
	{
		headers: { "User-Agent":options.userAgent },
		url: url
	},
	function(error, response)
	{
		var htmlString,responseUrl;
		
		if (error !== null)
		{
			callHandler.async(callback, invalidUrlError(error));
			return;
		}
		
		if (response.statusCode !== 200)
		{
			error = new Error("HTML could not be retrieved");
			error.code = response.statusCode;
		}
		else
		{
			// `url` not used in case header was redirected
			responseUrl = response.request.href;
			
			if (response.headers["content-type"].indexOf("text/html") === 0)
			{
				htmlString = response.body;
			}
			else
			{
				error = new Error('expected type "text/html" but got "'+response.headers["content-type"]+'"');
				error.code = response.statusCode;
			}
		}
		
		callHandler.sync(callback, [error, htmlString, responseUrl]);
	});
}



module.exports = getHtmlFromUrl;
