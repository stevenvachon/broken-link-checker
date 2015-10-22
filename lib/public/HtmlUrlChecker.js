"use strict";
var parseOptions = require("../internal/parseOptions");
var streamHtml   = require("../internal/streamHtml");

var HtmlChecker = require("./HtmlChecker");

var maybeCallback = require("maybe-callback");
var RequestQueue = require("limited-request-queue");



function HtmlUrlChecker(options, handlers)
{
	var thisObj = this;
	
	reset(this);
	
	this.handlers = handlers || {};
	this.options = options = parseOptions(options);
	
	this.htmlUrlQueue = new RequestQueue(
	{
		maxSockets: 1,
		rateLimit: this.options.rateLimit
	},
	{
		item: function(input, done)
		{
			thisObj.currentCustomData = input.data.customData;
			thisObj.currentDone = done;
			thisObj.currentPageUrl = input.url;
			
			streamHtml(thisObj.currentPageUrl, thisObj.__getCache(), thisObj.options).then( function(result)
			{
				// Internal event (undocumented)
				maybeCallback(thisObj.handlers.html)(thisObj.currentPageUrl, thisObj.currentCustomData);
				
				thisObj.htmlChecker.scan(result.stream, result.response.url);
			})
			.catch( function(error)
			{
				completedPage(thisObj, error);
			});
		},
		end: function()
		{
			// Clear references for garbage collection
			reset(thisObj);
			
			maybeCallback(thisObj.handlers.end)();
		}
	});
	
	this.htmlChecker = new HtmlChecker(this.options,
	{
		junk: function(result)
		{
			maybeCallback(thisObj.handlers.junk)(result, thisObj.currentCustomData);
		},
		link: function(result)
		{
			maybeCallback(thisObj.handlers.link)(result, thisObj.currentCustomData);
		},
		complete: function()
		{
			completedPage(thisObj, null);
		}
	});
}



HtmlUrlChecker.prototype.clearCache = function()
{
	return this.htmlChecker.clearCache();
};



HtmlUrlChecker.prototype.dequeue = function(id)
{
	return this.htmlUrlQueue.dequeue(id);
};



HtmlUrlChecker.prototype.enqueue = function(pageUrl, customData)
{
	return this.htmlUrlQueue.enqueue(
	{
		url: pageUrl,
		data: { customData:customData }
	});
};



HtmlUrlChecker.prototype.numActiveLinks = function()
{
	return this.htmlChecker.numActiveLinks();
};



HtmlUrlChecker.prototype.numPages = function()
{
	return this.htmlUrlQueue.length();
};



HtmlUrlChecker.prototype.numQueuedLinks = function()
{
	return this.htmlChecker.numQueuedLinks();
};



HtmlUrlChecker.prototype.pause = function()
{
	this.htmlChecker.pause();
	return this.htmlUrlQueue.pause();
};



HtmlUrlChecker.prototype.resume = function()
{
	this.htmlChecker.resume();
	return this.htmlUrlQueue.resume();
};



HtmlUrlChecker.prototype.__getCache = function()
{
	return this.htmlChecker.__getCache();
};



//::: PRIVATE FUNCTIONS



function completedPage(instance, error)
{
	maybeCallback(instance.handlers.page)(error, instance.currentPageUrl, instance.currentCustomData);
	
	// Auto-starts next queue item, if any
	// If not, fires "end"
	instance.currentDone();
}



function reset(instance)
{
	instance.currentCustomData = null;
	instance.currentDone = null;
	instance.currentPageUrl = null;
}



module.exports = HtmlUrlChecker;
