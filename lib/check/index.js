"use strict";
//var callUrl    = require("./callUrl");
var getLinks   = require("./getLinks");
var resolveUrl = require("./resolveUrl");

var requests = require("./requests");



function checkHtml(html, options, callback)
{
	var links = [];
	
	getLinks(html, function(linkObj)
	{
		linkObj.url = resolveUrl(linkObj.url, options);
		
		if (linkObj.url !== false)
		{
			// TODO :: what about rest of link object?
			links.push(linkObj.url);
		}
	});
	
	checkUrl(links, options, callback);
}



function checkHtmlUrl(url, options, callback)
{
	// request html source code
	// checkHtml(html)
}



function checkUrl(urls, options, callback)
{
	requests(urls,
	{
		oniterate: function(url)
		{
			return resolveUrl(url, options);
		},
		onresponse: function(result)
		{
			if (!result.error)
			{
				result.broken = result.response.statusCode !== 200;
				
				/*if (response.statusCode == 404) {
				    // perform error callback
				} else if (response.statusCode == 200) {
				    if (page.source == 404.source) {
				        // perform error callback
				    } else {
				        // perform OK callback
				    }
				}*/
			}
			else
			{
				result.broken = true;
			}
		},
		oncomplete: callback
	});
}



module.exports =
{
	html:    checkHtml,
	htmlUrl: checkHtmlUrl,
	url:     checkUrl
};
