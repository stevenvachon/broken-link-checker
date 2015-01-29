"use strict";
var linkObj    = require("./linkObj");
var parseLinks = require("./parseLinks");
var resolve    = require("./resolve");

var request = require("request");

var pools = {};



/*
	Call an event handler if it exists.
*/
function callHandler(handler, args, synchronous)
{
	if (typeof handler === "function")
	{
		if (args !== undefined)
		{
			if (Array.isArray(args) !== true)
			{
				args = [args];
			}
		}
		else
		{
			args = [];
		}
		
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
				callHandler.sync(handlers.link, result);
				
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
				callHandler.async(handlers.complete, null);
			}
		}
	});
}



function checkHtmlUrl(url, options, handlers)
{
	var resolvedUrl = resolve.url(url, options.base, options.acceptedSchemes);
	
	if (resolvedUrl === false)
	{
		callHandler.async(handlers.complete, invalidUrlError());
		return;
	}
	
	request(
	{
		headers: { "User-Agent":options.userAgent },
		pool: getPool(options.maxSockets),
		url: resolvedUrl
	},
	function(error, response)
	{
		if (error !== null)
		{
			callHandler.async(handlers.complete, invalidUrlError(error));
		}
		else
		{
			if (response.headers["content-type"].indexOf("text/html") === 0)
			{
				checkHtml(response.body, options, handlers);
			}
			else
			{
				callHandler.sync(handlers.complete, new Error('expected type "text/html" but got "'+response.headers["content-type"]+'"'));
			}
		}
	});
}



function checkUrl(url, options, callback)
{
	var link = (typeof url === "string") ? linkObj(url) : url;
	var resolvedBase = resolve.base(link.html.base, options.base);
	var resolvedUrl = resolve.url(link.url.original, resolvedBase, options.acceptedSchemes);
	
	if (options.base !== undefined) link.base.original = options.base;
	if (resolvedBase !== "")        link.base.resolved = resolvedBase;
	
	linkObj.clean(link);
	
	if (resolvedUrl === false)
	{
		link.broken = true;
		link.error = invalidUrlError();
		setImmediate(callback, link);
		return;
	}
	
	// Only requests header -- any body content is not downloaded
	request(
	{
		headers: { "User-Agent":options.userAgent },
		method: "HEAD",
		pool: getPool(options.maxSockets),
		url: resolvedUrl
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
	Gets and possibly creates a request pool based on a maximum number of sockets allowed.
*/
function getPool(maxSockets)
{
	if (pools[maxSockets] === undefined)
	{
		pools[maxSockets] = { maxSockets:maxSockets };
	}
	
	return pools[maxSockets];
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
