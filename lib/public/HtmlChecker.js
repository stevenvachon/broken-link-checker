"use strict";
var callHandler    = require("../internal/callHandler");
var HtmlLinkParser = require("../internal/HtmlLinkParser");
var linkObj        = require("../internal/linkObj");
var matchUrl       = require("../internal/matchUrl");
var parseOptions   = require("../internal/parseOptions");

var UrlChecker = require("./UrlChecker");



function HtmlChecker(options, handlers)
{
	var linkEnqueued;
	var thisObj = this;
	
	reset(this);
	
	this.handlers = handlers || {};
	this.options = parseOptions(options);
	
	this.htmlLinkParser = new HtmlLinkParser(this.options,
	{
		link: function(link)
		{
			linkObj.resolve(link, thisObj.baseUrl, thisObj.options);
			
			// If link should be ignored
			if (
			   	(thisObj.options.excludeExternalLinks===true   && link.internal===false) ||
			   	(thisObj.options.excludeInternalLinks===true   && link.internal===true) ||
			   	(thisObj.options.excludeLinksToSamePage===true && link.samePage===true) ||
			   	(thisObj.options.excludedSchemes[link.url.parsed.extra.protocolTruncated] === true) ||
			   	( matchUrl(link.url.resolved, thisObj.options.excludedKeywords) === true )
			   )
			{
				thisObj.linksSkipped++;
				return;
			}
			
			// Initial indexes are determined in parser -- preserves order of nested links
			// If any links were skipped above, future index gaps are avoided
			link.html.index -= thisObj.linksSkipped;
			
			linkEnqueued = thisObj.urlChecker.enqueue(link);
			
			if (linkEnqueued instanceof Error)
			{
				linkObj.broken(link, linkEnqueued);
				
				callHandler(thisObj.handlers.link, link);
			}
		},
		complete: function()
		{
			thisObj.parsed = true;
			
			// If no links found or all links already checked
			if (thisObj.urlChecker.length()===0 && thisObj.urlChecker.numActive()===0)
			{
				callHandler(complete, thisObj);
			}
		}
	});
	
	this.urlChecker = new UrlChecker(this.options,
	{
		link: function(result)
		{
			callHandler(thisObj.handlers.link, result);
		},
		end: function()
		{
			// If stream finished
			if (thisObj.parsed === true)
			{
				callHandler(complete, thisObj);
			}
		}
	});
}



HtmlChecker.prototype.clearCache = function()
{
	this.urlChecker.clearCache();
};



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
		
		this.htmlLinkParser.parse(htmlString);
		
		return true;
	}
	else
	{
		return false;
	}
};



//::: PRIVATE FUNCTIONS



function complete(instance)
{
	reset(instance);
	
	callHandler(instance.handlers.complete);
}



function reset(instance)
{
	instance.active = false;
	instance.baseUrl = undefined;
	instance.linksSkipped = 0;
	instance.parsed = false;
}



module.exports = HtmlChecker;
