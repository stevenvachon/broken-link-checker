"use strict";
var callHandler = require("../common/callHandler");

var checkUrl = require("./checkUrl");

var RequestQueue = require("limited-request-queue");



function checkHtml(html, options, handlers)
{
	var linkCount = 0;
	var resultCount = 0;
	
	var linkQueue = new RequestQueue(
	{
		maxSockets:        options.maxSockets,
		maxSocketsPerHost: options.maxSocketsPerHost,
		rateLimit:         options.rateLimit
	},
	{
		drain: function()
		{
			callHandler.sync(handlers.complete);
		}
	});
	
	
	
	
	
	parseLinks(html, options,
	{
		link: function(link)
		{
			linkCount++;
			
			/*linkQueue.enqueue(htmlUrl, function(error, id)
			{
			
			checkUrl(link, options, function(result)
			{
				callHandler.sync(handlers.link, result);
				
				if (++resultCount >= linkCount)
				{
					callHandler.sync(handlers.complete, null);
				}
			});*/
		},
		complete: function()
		{
			// If no links found
			if (linkCount === 0)
			{
				callHandler.async(handlers.complete, null);
			}
		}
	});
}