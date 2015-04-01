"use strict";
var callHandler    = require("../internal/callHandler");
var getHtmlFromUrl = require("../internal/getHtmlFromUrl");
var parseOptions   = require("../internal/parseOptions");

var HtmlChecker = require("./HtmlChecker");

var RequestQueue = require("limited-request-queue");



function HtmlUrlChecker(options, handlers)
{
	var thisObj = this;
	
	this.currentDone = null;
	this.currentHtmlUrl = null;
	this.handlers = handlers || {};
	this.options = parseOptions(options);
	
	this.htmlUrlQueue = new RequestQueue(
	{
		maxSockets: 1,
		maxSocketsPerHost: Infinity,
		rateLimit: this.options.rateLimit
	},
	{
		item: function(input, done)
		{
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
			});
		},
		error: function(error, id, input)
		{
			callHandler.async(thisObj.handlers.item, [error, input.url]);
		},
		end: function()
		{
			callHandler.sync(thisObj.handlers.end);
		}
	});
	
	this.htmlChecker = new HtmlChecker(this.options,
	{
		link: function(result)
		{
			callHandler.sync(thisObj.handlers.link, result);
		},
		complete: function()
		{
			complete(thisObj, null);
		}
	});
}



HtmlUrlChecker.prototype.dequeue = function(id)
{
	return this.htmlUrlQueue.dequeue(id);
};



HtmlUrlChecker.prototype.enqueue = function(htmlUrl)
{
	return this.htmlUrlQueue.enqueue(htmlUrl);
};



HtmlUrlChecker.prototype.length = function()
{
	return this.htmlUrlQueue.length();
};



HtmlUrlChecker.prototype.pause = function()
{
	this.htmlUrlQueue.pause();
	this.linkQueue.pause();
};



HtmlUrlChecker.prototype.resume = function()
{
	this.htmlUrlQueue.resume();
	this.linkQueue.resume();
};



//::: PRIVATE FUNCTIONS



function complete(instance, error)
{
	// TODO :: reset currentHtmlUrl and currentId ?
	
	callHandler.sync(instance.handlers.item, [error, instance.currentHtmlUrl]);
	
	// Auto-starts next queue item, if any
	// If not, fires "end"
	instance.currentDone();
}



module.exports = HtmlUrlChecker;
