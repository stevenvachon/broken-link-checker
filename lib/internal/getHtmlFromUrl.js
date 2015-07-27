"use strict";
var invalidUrlError = require("./invalidUrlError");

var bhttp = require("bhttp");



/*
	Request a URL for its HTML contents.
*/
function getHtmlFromUrl(url, options, callback)
{
	bhttp.get(url, 
	{
		headers: { "user-agent":options.userAgent }
	},
	function(error, response)
	{
		var htmlString,responseUrl;
		
		if (error !== null)
		{
			callback( invalidUrlError(error) );
			return;
		}
		
		if (response.statusCode !== 200)
		{
			error = new Error("HTML could not be retrieved");
			error.code = response.statusCode;
		}
		else
		{
			responseUrl = response.request.url;
			
			if (response.headers["content-type"].indexOf("text/html") === 0)
			{
				htmlString = response.body.toString();
			}
			else
			{
				error = new Error('expected type "text/html" but got "'+response.headers["content-type"]+'"');
				error.code = response.statusCode;
			}
		}
		
		callback(error, htmlString, responseUrl);
	});
}



module.exports = getHtmlFromUrl;
