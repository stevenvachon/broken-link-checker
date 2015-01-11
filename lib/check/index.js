"use strict";
var callUrl    = require("./callUrl");
var getLinks   = require("./getLinks");
var resolveUrl = require("./resolveUrl");



function checkHtml(html, options, callback)
{
	getLinks(html, function(linkObj)
	{
		linkObj.url = resolveUrl(linkObj.url, options);
		
		if (linkObj.url !== false)
		{
			//callUrl(link.url, function(error, broken, response)
			//{
				callback(linkObj);
			//});
		}
	});
}



function checkHtmlUrl(url, options, callback)
{
	// request html source code
	// checkHtml(html)
}



function checkUrl(url, options, callback)
{
	url = resolveUrl(url, options);
	
	if (url !== false)
	{
		callUrl(url, callback);
	}
	else
	{
		// dunno yet
	}
}



module.exports =
{
	html:    checkHtml,
	htmlUrl: checkHtmlUrl,
	url:     checkUrl
};
