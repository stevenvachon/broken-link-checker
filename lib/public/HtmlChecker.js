"use strict";
var callHandler    = require("../internal/callHandler");
var HtmlLinkParser = require("../internal/HtmlLinkParser");
var linkObj        = require("../internal/linkObj");
var parseOptions   = require("../internal/parseOptions");

var UrlChecker = require("./UrlChecker");



function HtmlChecker(options, handlers)
{
	var linkEnqueued;
	var thisObj = this;
	
	this.active = false;
	this.baseUrl = undefined;
	this.handlers = handlers || {};
	this.linksSkipped = 0;
	this.options = parseOptions(options);
	this.parsed = false;
	
	this.htmlLinkParser = new HtmlLinkParser(this.options,
	{
		link: function(link)
		{
			// TODO :: if link.url.resolved results in null, this function will run AGAIN in checkUrl()
			linkObj.resolve(link, thisObj.baseUrl, thisObj.options);
			
			// If link should be ignored
			if (
			   	(link.internal===true && thisObj.options.excludeInternalLinks===true) ||
			   	(link.internal===false && thisObj.options.excludeExternalLinks===true) ||
			   	(link.samePage===true && thisObj.options.excludeLinksToSamePage===true) ||
			   	(thisObj.options.excludedSchemes[link.url.parsed.protocolTruncated] === true)
			   )
			{
				thisObj.linksSkipped++;
				return;
			}
			
			// Initial idexes are determined in parser -- preserves order of nested links
			// If any links were skipped above, future index gaps are avoided
			link.html.index -= thisObj.linksSkipped;
			
			linkEnqueued = thisObj.urlChecker.enqueue(link);
			
			if (linkEnqueued instanceof Error)
			{
				linkObj.broken(link, linkEnqueued);
				
				callHandler.sync(thisObj.handlers.link, link);
			}
		},
		complete: function()
		{
			thisObj.parsed = true;
			
			// If no links found or all links already checked
			if (thisObj.urlChecker.length()===0 && thisObj.urlChecker.numActive()===0)
			{
				// TODO :: could cause issues since "complete" is asynchronous
				thisObj.active = false;
				
				callHandler.async(thisObj.handlers.complete);
			}
		}
	});
	
	// TODO :: UrlChecker runs parseOptions on its options... so it runs more than once
	this.urlChecker = new UrlChecker(this.options,
	{
		link: function(result)
		{
			callHandler.sync(thisObj.handlers.link, result);
		},
		end: function()
		{
			// If stream finished
			if (thisObj.parsed === true)
			{
				thisObj.active = false;
				
				callHandler.sync(thisObj.handlers.complete);
			}
		}
	});
}



HtmlChecker.prototype.numActive = function()
{
	return this.urlChecker.numActive();
};



HtmlChecker.prototype.pause = function()
{
	this.urlChecker.pause();
};



HtmlChecker.prototype.resume = function()
{
	this.urlChecker.resume();
};



HtmlChecker.prototype.scan = function(htmlString, baseUrl)
{
	if (this.active === false)
	{
		this.active = true;
		this.baseUrl = baseUrl;
		this.parsed = false;
		
		this.htmlLinkParser.parse(htmlString);
		
		return true;
	}
	else
	{
		return false;
	}
};



module.exports = HtmlChecker;
