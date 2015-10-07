"use strict";
var getHtmlFromUrl = require("../internal/getHtmlFromUrl");
var parseOptions   = require("../internal/parseOptions");

var HtmlChecker = require("./HtmlChecker");

var maybeCallback = require("maybe-callback");
var RequestQueue = require("limited-request-queue");



// TODO :: store a url history (using urlcache) to avoid scanning same htmlUrls twice in crawl mode (especially when cacheResponses=false)
function HtmlUrlChecker(options, handlers)
{
	var thisObj = this;
	
	reset(this);
	
	this.handlers = handlers || {};
	this.options = parseOptions(options);
	
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
			thisObj.currentHtmlUrl = input.url;
			
			// TODO :: make callback reusable
			getHtmlFromUrl(thisObj.currentHtmlUrl, thisObj.__getCache(), thisObj.options).then( function(result)
			{
				//thisObj.history.set(result.url, true);
				
				thisObj.htmlChecker.scan(result.html, result.url);
				
				// Internal event (undocumented)
				maybeCallback(thisObj.handlers.html)(input.id);
			})
			.catch( function(error)
			{
				complete(thisObj, error);
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
		link: function(result)
		{
			maybeCallback(thisObj.handlers.link)(result, thisObj.currentCustomData);
			
			//if (thisObj.options.crawl===true) maybeEnqueue()
		},
		junk: function(result)
		{
			maybeCallback(thisObj.handlers.junk)(result, thisObj.currentCustomData);
			
			//if (thisObj.options.crawl===true) maybeEnqueue()
		},
		complete: function()
		{
			complete(thisObj, null);
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



HtmlUrlChecker.prototype.enqueue = function(htmlUrl, customData)
{
	return this.htmlUrlQueue.enqueue(
	{
		url: htmlUrl,
		data: { customData:customData }
	});
};



HtmlUrlChecker.prototype.length = function()
{
	return this.htmlUrlQueue.length();
};



HtmlUrlChecker.prototype.numActiveItems = function()
{
	return this.htmlUrlQueue.numActive();
};



HtmlUrlChecker.prototype.numActiveLinks = function()
{
	return this.htmlChecker.numActive();
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



function complete(instance, error)
{
	maybeCallback(instance.handlers.item)(error, instance.currentHtmlUrl, instance.currentCustomData);
	
	// Auto-starts next queue item, if any
	// If not, fires "end"
	instance.currentDone();
}



function reset(instance)
{
	instance.currentCustomData = null;
	instance.currentDone = null;
	instance.currentHtmlUrl = null;
}



module.exports = HtmlUrlChecker;
