"use strict";
var callHandler = require("./callHandler");
var linkObj     = require("./linkObj");
var urlObj      = require("./urlObj");

var bhttp = require("bhttp");
var urllib = require("url");



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
	bhttp.request(link.url.resolved,
	{
		headers: { "user-agent":options.userAgent },
		method: "head"
	},
	function(error, response)
	{
		var execution,redirectedUrl;
		
		if (error !== null)
		{
			linkObj.broken(link, error);
			execution = "async";
		}
		else
		{
			link.broken = response.statusCode !== 200;
			
			link.http.redirects = parseRedirects(response.redirectHistory);
			link.http.statusCode = response.statusCode;
			
			if (options.excludeResponseData !== true)
			{
				link.http.response = response;
			}
			
			if (link.url.resolved !== response.request.url)
			{
				link.url.redirected = response.request.url;
				
				if (link.base.resolved !== null)
				{
					redirectedUrl = urllib.parse(link.url.redirected);
					
					link.internal = urlObj.areInternal(link.base.parsed, redirectedUrl);
					link.samePage = urlObj.areSamePage(link.base.parsed, redirectedUrl, link.internal);
				}
			}
			
			execution = "sync";
		}
		
		linkObj.clean(link);
		callHandler[execution](callback, link);
	});
}



/*
	Turns:
	
	[ { statusCode:302, request:{url:"http://domain1.com/",…}, … },
	  { statusCode:301, request:{url:"http://domain2.com/",…}, … } ]
	
	Into:
	
	[ { statusCode:302, url:"http://domain1.com/" },
	  { statusCode:301, url:"http://domain2.com/" } ]
*/
function parseRedirects(redirects)
{
	var i;
	var numRedirects = redirects.length;
	var result = [];
	
	for (i=0; i<numRedirects; i++)
	{
		result.push(
		{
			statusCode: redirects[i].statusCode,
			url:        redirects[i].request.url
		});
	}
	
	return result;
}



module.exports = checkUrl;
