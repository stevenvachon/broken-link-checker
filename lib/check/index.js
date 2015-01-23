"use strict";
var linkObj    = require("./linkObj");
var parseLinks = require("./parseLinks");
var resolveUrl = require("./resolveUrl");

// TODO :: use request.defaults() when possible for performance
var request = require("request");



/*
	Call an event handler if it exists.
*/
function callHandler(handler, args, synchronous)
{
	if (typeof handler === "function")
	{
		if (synchronous === true)
		{
			handler.apply(null, args);
		}
		else
		{
			args.unshift(handler);
			
			setImmediate.apply(null, args);
		}
	}
}

callHandler.async = function(handler, args)
{
	callHandler(handler, args, false);
};

callHandler.sync = function(handler, args)
{
	callHandler(handler, args, true);
};



function checkHtml(html, options, handlers)
{
	var linkCount = 0;
	var resultCount = 0;
	
	parseLinks(html, options,
	{
		link: function(link)
		{
			checkUrl(link, options, function(result)
			{
				callHandler.sync(handlers.link, [result]);
				
				if (++resultCount >= linkCount)
				{
					callHandler.sync(handlers.complete, null);
				}
			});
			
			linkCount++;
		},
		complete: function()
		{
			// If no links found
			if (linkCount === 0)
			{
				callHandler.sync(handlers.complete, null);
			}
		}
	});
}



function checkHtmlUrl(url, options, handlers)
{
	var resolvedUrl = resolveUrl(url, options);
	
	if (resolvedUrl === false)
	{
		callHandler.async(handlers.complete, invalidUrlError());
		return;
	}
	
	request(resolvedUrl, function(error, response)
	{
		if (error !== null)
		{
			callHandler.sync(handlers.complete, invalidUrlError(error));
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
	var resolvedUrl = resolveUrl(link.url.original, options);
	
	linkObj.clean(link);
	
	if (resolvedUrl === false)
	{
		link.broken = true;
		link.error = invalidUrlError();
		setImmediate(callback, link);
		return;
	}
	
	request(
	{
		url: resolvedUrl,
		timeout: 20000	// linux default
	},
	function(error, response)
	{
		link.url.resolved = resolvedUrl;
		
		if (error !== null)
		{
			link.broken = true;
			link.error = invalidUrlError(error);
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



/*
	Convert request.js invalid uri error to this library's version of the same
	for consistency.
	
	If different type of error, return original.
	If no error passed as input, return new error.
*/
function invalidUrlError(error)
{
	var createNew = true;
	
	if (error instanceof Error)
	{
		createNew = error.message.indexOf("Invalid URI") === 0;
	}
	
	if (createNew === true)
	{
		error = new Error("Invalid URL");
	}
	
	return error;
}



module.exports =
{
	html:    checkHtml,
	htmlUrl: checkHtmlUrl,
	url:     checkUrl
};
