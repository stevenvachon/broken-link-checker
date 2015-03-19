"use strict";
var callHandler     = require("../common/callHandler");
var invalidUrlError = require("../common/invalidUrlError");
var linkObj         = require("../common/linkObj");
var parseOptions    = require("../common/parseOptions");

var checkUrl = require("../static/checkUrl");

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
		drain: function()
		{
			callHandler.sync(thisObj.handlers.queueComplete);
		}
	});
}



UrlChecker.prototype.enqueue = function(url, base)
{
	var thisObj = this;
	
	this.linkQueue.enqueue(url, function(error, id)
	{
		// TODO :: do anything with `error`?
		/*if (error !== null)
		{
			callHandler.async(thisObj.handlers.link, [error, url]);
			return;
		}*/
		
		checkUrl(url, base, thisObj.options, function(result)
		{
			callHandler.sync(thisObj.handlers.link, result);
			
			// Auto-starts next queue item, if any
			// If not, fires "drain"
			thisObj.linkQueue.dequeue(id);
		});
	});
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
