"use strict";
var callHandler    = require("../internal/callHandler");
var getHtmlFromUrl = require("../internal/getHtmlFromUrl");
var parseOptions   = require("../internal/parseOptions");

var HtmlChecker = require("./HtmlChecker");

var RequestQueue = require("limited-request-queue");



function HtmlUrlChecker(options, handlers)
{
	var thisObj = this;
	
	this.currentHtmlUrl = null;
	this.currentId = null;
	this.handlers = handlers || {};
	this.options = parseOptions(options);
	
	this.htmlUrlQueue = new RequestQueue(
	{
		maxSockets:        1,
		maxSocketsPerHost: Infinity,
		rateLimit:         this.options.rateLimit
	},
	{
		item: function(id, htmlUrl, data)
		{
			// TODO :: these need a reset()
			thisObj.currentHtmlUrl = htmlUrl;
			thisObj.currentId = id;
			
			// TODO :: make callback reusable
			getHtmlFromUrl(htmlUrl, thisObj.options, function(error, html, responseUrl)
			{
				if (error !== null)
				{
					callHandler.sync(thisObj.handlers.queueItemComplete, [error, htmlUrl]);
					
					// Auto-starts next queue item, if any
					// If not, fires "end"
					thisObj.htmlUrlQueue.dequeue(id);
					return;
				}
				
				thisObj.htmlChecker.scan(html, responseUrl);
			});
		},
		error: function(error, id, htmlUrl, data)
		{
			callHandler.async(thisObj.handlers.queueItemComplete, [error, htmlUrl]);
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
			callHandler.sync(thisObj.handlers.queueItemComplete, [null, thisObj.currentHtmlUrl]);
			
			// Auto-starts next queue item, if any
			// If not, fires "end"
			thisObj.htmlUrlQueue.dequeue(thisObj.currentId);
		}
	});
}



HtmlUrlChecker.prototype.enqueue = function(htmlUrl)
{
	this.htmlUrlQueue.enqueue(htmlUrl);
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



module.exports = HtmlUrlChecker;
