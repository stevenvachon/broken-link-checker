"use strict";
var callHandler    = require("../internal/callHandler");
var getHtmlFromUrl = require("../internal/getHtmlFromUrl");
var parseOptions   = require("../internal/parseOptions");

var HtmlChecker = require("./HtmlChecker");

var RequestQueue = require("limited-request-queue");



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
			getHtmlFromUrl(thisObj.currentHtmlUrl, thisObj.options, function(error, htmlString, responseUrl)
			{
				if (error !== null)
				{
					complete(thisObj, error);
					return;
				}
				
				thisObj.htmlChecker.scan(htmlString, responseUrl);
				
				// Internal event (undocumented)
				callHandler(thisObj.handlers.html, [input.id]);
			});
		},
		end: function()
		{
			// Clear references for garbage collection
			reset(thisObj);
			
			callHandler(thisObj.handlers.end);
		}
	});
	
	this.htmlChecker = new HtmlChecker(this.options,
	{
		link: function(result)
		{
			callHandler(thisObj.handlers.link, [result, thisObj.currentCustomData]);
		},
		junk: function(result)
		{
			callHandler(thisObj.handlers.junk, [result, thisObj.currentCustomData]);
		},
		complete: function()
		{
			complete(thisObj, null);
		}
	});
}



HtmlUrlChecker.prototype.clearCache = function()
{
	this.htmlChecker.clearCache();
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
	this.htmlUrlQueue.pause();
};



HtmlUrlChecker.prototype.resume = function()
{
	this.htmlChecker.resume();
	this.htmlUrlQueue.resume();
};



//::: PRIVATE FUNCTIONS



function complete(instance, error)
{
	callHandler(instance.handlers.item, [error, instance.currentHtmlUrl, instance.currentCustomData]);
	
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
