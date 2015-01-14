"use strict";
//var callUrl    = require("./callUrl");
var getLinks   = require("./getLinks");
var linkObj    = require("./linkObj");
var resolveUrl = require("./resolveUrl");

// TODO :: use request.defaults() when possible for performance
var request = require("request");
//var requests = require("./requests");



function checkHtml(html, options, callback)
{
	var count = 0;
	
	getLinks(html, function(link)
	{
		checkUrl(link, options, callback, count++);
	});
}



function checkHtmlUrl(url, options, callback)
{
	var resolvedUrl = resolveUrl(url, options);
	
	if (resolvedUrl === false)
	{
		callback( new Error("invalid url") );
		return;
	}
	
	request(resolvedUrl, function(error, response)
	{
		if (error)
		{
			callback(error);
		}
		else
		{
			checkHtml(response.body, options, callback);
		}
	});
}



function checkUrl(url, options, callback, i)
{
	var link = (typeof url === "string") ? linkObj(url) : url;
	var resolvedUrl = resolveUrl(link.url, options);
	
	if (resolvedUrl === false)
	{
		link.broken = true;
		link.error = new Error("invalid url");
		callback(link, i);
		return;
	}
	
	request(
	{
		url: resolvedUrl,
		timeout: options.timeout
	},
	function(error, response)
	{
		link.resolvedUrl = resolvedUrl;
		
		if (error)
		{
			link.broken = true;
			link.error = error;
		}
		else
		{
			link.broken = response.statusCode !== 200;
			link.response = response;
			
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
		
		callback(link, i);
	});
}



/*function checkUrl(urls, options, callback)
{
	requests(urls,
	{
//		requestOptions:
//		{
//			timeout: options.timeout
//		},
		
		oniterate: function(url)
		{
			return resolveUrl(url, options);
		},
		onresponse: function(result)
		{
			if (!result.error)
			{
				result.broken = result.response.statusCode !== 200;
				
//				if (response.statusCode == 404) {
//				    // perform error callback
//				} else if (response.statusCode == 200) {
//				    if (page.source == 404.source) {
//				        // perform error callback
//				    } else {
//				        // perform OK callback
//				    }
//				}
			}
			else
			{
				result.broken = true;
			}
		},
		oncomplete: callback
	});
}*/



module.exports =
{
	html:    checkHtml,
	htmlUrl: checkHtmlUrl,
	url:     checkUrl
};
