"use strict";
var callHandler     = require("../internal/callHandler");
var checkUrl        = require("../internal/checkUrl");
var invalidUrlError = require("../internal/invalidUrlError");
var linkObj         = require("../internal/linkObj");
var parseOptions    = require("../internal/parseOptions");

var RequestQueue = require("limited-request-queue");



function UrlChecker(options, handlers)
{
	var thisObj = this;
	
	this.handlers = handlers || {};
	this.options = parseOptions(options);
	
	this.linkQueue = new RequestQueue(
	{
		maxSockets:        this.options.maxSockets,
		maxSocketsPerHost: this.options.maxSocketsPerHost,
		rateLimit:         this.options.rateLimit
	},
	{
		item: function(id, url, data)
		{
			if (data.linkObj !== undefined)
			{
				// TODO :: make callback reusable
				checkUrl(data.linkObj, null, thisObj.options, function(result)
				{
					callHandler.sync(thisObj.handlers.link, result);
					
					// Auto-starts next queue item, if any
					// If not, fires "end"
					thisObj.linkQueue.dequeue(id);
				});
			}
			else
			{
				// TODO :: make callback reusable
				checkUrl(url, data.base, thisObj.options, function(result)
				{
					callHandler.sync(thisObj.handlers.link, result);
					
					// Auto-starts next queue item, if any
					// If not, fires "end"
					thisObj.linkQueue.dequeue(id);
				});
			}
		},
		// TODO :: do anything with this?
		/*error: function(error, id, url, data)
		{
			callHandler.async(thisObj.handlers.link, [error, url]);
		},*/
		end: function()
		{
			callHandler.sync(thisObj.handlers.end);
		}
	});
}



UrlChecker.prototype.enqueue = function(url, base)
{
	// Documented use: enqueue(url, base)
	if (typeof url==="string" || url instanceof String)
	{
		this.linkQueue.enqueue(
		{
			url: url,
			data: { base:base }
		});
	}
	// Undocumented internal use: enqueue(linkObj)
	else if (typeof url === "object")
	{
		this.linkQueue.enqueue(
		{
			url: linkObj.url.resolved,	// TODO :: what if this is `null` ?
			data: { linkObj:url }
		});
	}
};



UrlChecker.prototype.length = function()
{
	return this.linkQueue.length();
};



UrlChecker.prototype.pause = function()
{
	this.linkQueue.pause();
};



UrlChecker.prototype.resume = function()
{
	this.linkQueue.resume();
};



module.exports = UrlChecker;
