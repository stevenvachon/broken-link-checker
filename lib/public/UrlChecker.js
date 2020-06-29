"use strict";
var checkUrl     = require("../internal/checkUrl");
var linkObj      = require("../internal/linkObj");
var parseOptions = require("../internal/parseOptions");

var isString = require("is-string");
var maybeCallback = require("maybe-callback");
var RequestQueue = require("limited-request-queue");
var UrlCache = require("urlcache");
var urlobj = require("urlobj");



function UrlChecker(options, handlers)
{
	var thisObj = this;
	
	this.handlers = handlers || {};
	this.options = options = parseOptions(options);

	this.cache = new UrlCache(
	{
		expiryTime: this.options.cacheExpiryTime,
		normalizeUrls: false
	});
	
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
				maybeCallback(thisObj.handlers.link)(result, input.data.customData);
				
				// Auto-starts next queue item, if any
				// If not, fires "end"
				done();
			}
			
			if (input.data.linkObj !== undefined)
			{
				checkUrl(input.data.linkObj, null, thisObj.cache, thisObj.options).then(handle_checkUrl);
			}
			else
			{
				// TODO :: send url object -- remove orgUrl?
				checkUrl(input.data.orgUrl, input.data.baseUrl, thisObj.cache, thisObj.options).then(handle_checkUrl);
			}
		},
		end: function()
		{
			maybeCallback(thisObj.handlers.end)();
		}
	});
}



UrlChecker.prototype.clearCache = function()
{
	return this.cache.clear();
};



UrlChecker.prototype.dequeue = function(id)
{
	return this.linkQueue.dequeue(id);
};



UrlChecker.prototype.enqueue = function(url, baseUrl, customData)
{
	// Undocumented internal use: enqueue(linkObj)
	if (isString(url)===false && url.broken_link_checker===true)
	{
		return this.linkQueue.enqueue(
		{
			url: url.url.parsed,
			data: { customData:customData, linkObj:url }
		});
	}
	// Documented use: enqueue(url, baseUrl)
	// or erroneous and let linkQueue sort it out
	else
	{
		return this.linkQueue.enqueue(
		{
			url: urlobj.resolve(baseUrl || "", urlobj.parse(url) ),  // URL must be absolute
			data: { orgUrl:url, baseUrl:baseUrl, customData:customData }
		});
	}
};



UrlChecker.prototype.numActiveLinks = function()
{
	return this.linkQueue.numActive();
};



UrlChecker.prototype.numQueuedLinks = function()
{
	return this.linkQueue.numQueued();
};



UrlChecker.prototype.pause = function()
{
	return this.linkQueue.pause();
};



UrlChecker.prototype.resume = function()
{
	return this.linkQueue.resume();
};



UrlChecker.prototype.__getCache = function()
{
	return this.cache;
};



module.exports = UrlChecker;
