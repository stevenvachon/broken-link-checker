"use strict";
var parseOptions = require("../internal/parseOptions");
var streamHtml   = require("../internal/streamHtml");

var HtmlChecker = require("./HtmlChecker");

var maybeCallback = require("maybe-callback");
var RequestQueue = require("limited-request-queue");
var RobotDirectives = require("robot-directives");



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
				thisObj.currentResponse = result.response;
				
				thisObj.currentRobots = new RobotDirectives({ userAgent: thisObj.options.userAgent });
				
				robotHeaders(thisObj);
				
				// Passes robots instance so that headers are included in robot exclusion checks
				thisObj.htmlChecker.scan(result.stream, result.response.url, thisObj.currentRobots);
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
		html: function(tree, robots)
		{
			maybeCallback(thisObj.handlers.html)(tree, robots, thisObj.currentResponse, thisObj.currentPageUrl, thisObj.currentCustomData);
		},
		_filter: function(result)
		{
			// Undocumented handler for excluding links via custom constraints
			return maybeCallback(thisObj.handlers._filter)(result);
		},
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
	instance.currentResponse = null;
	instance.currentRobots = null;
}



function robotHeaders(instance)
{
	// TODO :: https://github.com/joepie91/node-bhttp/issues/20
	// TODO :: https://github.com/nodejs/node/issues/3591
	if (instance.currentResponse.headers["x-robots-tag"] != null)
	{
		instance.currentRobots.header( instance.currentResponse.headers["x-robots-tag"] );
	}
}



module.exports = HtmlUrlChecker;
