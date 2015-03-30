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
		if (error !== null)
		{
			callHandler.async(callback, invalidUrlError(error));
			return;
		}
		
		if (response.headers["content-type"].indexOf("text/html") === 0)
		{
			// Pass `response.request.href` in case URL was redirected
			callHandler.sync(callback, [null, response.body, response.request.href]);
		}
		else
		{
			callHandler.sync(callback, new Error('expected type "text/html" but got "'+response.headers["content-type"]+'"'));
		}
	});
}



module.exports = getHtmlFromUrl;
