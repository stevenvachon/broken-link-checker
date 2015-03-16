"use strict";
var callHandler    = require("../common/callHandler");
var getHtmlFromUrl = require("../common/getHtmlFromUrl");
var parseOptions   = require("../common/parseOptions");

var checkHtml = require("../static/checkHtml");

var RequestQueue = require("limited-request-queue");



function HtmlUrlChecker(options, handlers)
{
	var thisObj = this;
	
	this.handlers = handlers || {};
	this.options = parseOptions(options);
	
	this.htmlUrlQueue = new RequestQueue(
	{
		maxSockets:        1,
		maxSocketsPerHost: Infinity,
		rateLimit:         this.options.rateLimit
	});
	
	this.linkQueue = new RequestQueue(
	{
		maxSockets:        this.options.maxSockets,
		maxSocketsPerHost: this.options.maxSocketsPerHost,
		rateLimit:         this.options.rateLimit
	},
	{
		drain: function()
		{
			if (thisObj.htmlUrlQueue.length() === 0)
			{
				callHandler.sync(thisObj.handlers.queueComplete);
			}
			
			// Else auto-starts next queue item
		}
	});
}



HtmlUrlChecker.prototype.enqueue = function(htmlUrl)
{
	var thisObj = this;
	
	this.htmlUrlQueue.enqueue(htmlUrl, function(error, id)
	{
		if (error !== null)
		{
			callHandler.async(thisObj.handlers.queueItemComplete, [error, htmlUrl]);
			return;
		}
		
		getHtmlFromUrl(htmlUrl, thisObj.options, function(error, html, updatedOptions)
		{
			if (error !== null)
			{
				callHandler.sync(thisObj.handlers.queueItemComplete, [error, htmlUrl]);
				
				// Auto-starts next queue item, if any
				// If not, fires "drain"
				thisObj.htmlUrlQueue.dequeue(id);
				return;
			}
			
			// TODO :: use HtmlChecker class instead?
			checkHtml(html, updatedOptions,
			{
				link: function(result)
				{
					callHandler.sync(thisObj.handlers.link, result);
				},
				complete: function()
				{
					callHandler.sync(thisObj.handlers.queueItemComplete, [null, htmlUrl]);
					
					// Auto-starts next queue item, if any
					// If not, fires "drain"
					thisObj.htmlUrlQueue.dequeue(id);
				}
			});
		});
	});
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
