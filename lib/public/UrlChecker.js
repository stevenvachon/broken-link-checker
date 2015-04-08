"use strict";
var callHandler     = require("../internal/callHandler");
var checkUrl        = require("../internal/checkUrl");
var invalidUrlError = require("../internal/invalidUrlError");
var linkObj         = require("../internal/linkObj");
var parseOptions    = require("../internal/parseOptions");

var RequestQueue = require("limited-request-queue");
var urllib = require("url");



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
		item: function(input, done)
		{
			// TODO :: make this more reusable
			function handle_checkUrl(result)
			{
				callHandler.sync(thisObj.handlers.link, [result, input.data.customData]);
				
				// Auto-starts next queue item, if any
				// If not, fires "end"
				done();
			}
			
			if (input.data.linkObj !== undefined)
			{
				checkUrl(input.data.linkObj, null, thisObj.options, handle_checkUrl);
			}
			else
			{
				checkUrl(input.data.orgUrl, input.data.baseUrl, thisObj.options, handle_checkUrl);
			}
		},
		// TODO :: probably run same handler as `item` because erroneous URLs still need their linkObj's updated via checkUrl()
		// TODO :: if url was null/etc, how to handle that?
		/*error: function(error, id, input)
		{
			callHandler.async(thisObj.handlers.link, [error, input.url]);
		},*/
		end: function()
		{
			callHandler.sync(thisObj.handlers.end);
		}
	});
}



UrlChecker.prototype.dequeue = function(id)
{
	return this.linkQueue.dequeue(id);
};



UrlChecker.prototype.enqueue = function(url, baseUrl, customData)
{
	// Undocumented internal use: enqueue(linkObj)
	if (typeof url==="object" && !(url instanceof String) && url.broken_link_checker===true)
	{
		return this.linkQueue.enqueue(
		{
			url: url.url.resolved || url.url.original,
			data: { customData:customData, linkObj:url }
		});
	}
	// Documented use: enqueue(url, baseUrl)
	// or erroneous and let linkQueue sort it out
	else
	{
		return this.linkQueue.enqueue(
		{
			url: urllib.resolve(baseUrl || "", url),	// URL must be absolute
			data: { orgUrl:url, baseUrl:baseUrl, customData:customData }
		});
	}
};



UrlChecker.prototype.length = function()
{
	return this.linkQueue.length();
};



UrlChecker.prototype.numActive = function()
{
	return this.linkQueue.numActive();
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
