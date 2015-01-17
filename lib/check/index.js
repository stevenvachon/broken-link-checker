"use strict";
var linkObj    = require("./linkObj");
var parseLinks = require("./parseLinks");
var resolveUrl = require("./resolveUrl");

// TODO :: use request.defaults() when possible for performance
var request = require("request");



function checkHtml(html, options, handlers)
{
	var linkCount = 0;
	var resultCount = 0;
	
	parseLinks(html, options, function(link)
	{
		checkUrl(link, options, function(result)
		{
			handlers.link(result);
			
			if (++resultCount >= linkCount)
			{
				handlers.complete(null);
			}
		});
		
		linkCount++;
	});
}



function checkHtmlUrl(url, options, handlers)
{
	var resolvedUrl = resolveUrl(url, options);
	
	if (resolvedUrl === false)
	{
		setImmediate(handlers.complete, new Error("invalid url"));
		return;
	}
	
	request(resolvedUrl, function(error, response)
	{
		if (error !== null)
		{
			handlers.complete(error);
		}
		else
		{
			checkHtml(response.body, options, handlers);
		}
	});
}



function checkUrl(url, options, callback)
{
	var link = (typeof url === "string") ? linkObj(url) : url;
	var resolvedUrl = resolveUrl(link.url, options);
	
	linkObj.clean(link);
	
	if (resolvedUrl === false)
	{
		link.broken = true;
		link.error = new Error("invalid url");
		setImmediate(callback, link);
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
		
		if (error !== null)
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
		
		callback(link);
	});
}



module.exports =
{
	html:    checkHtml,
	htmlUrl: checkHtmlUrl,
	url:     checkUrl
};
