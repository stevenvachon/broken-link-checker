"use strict";
var callHandler    = require("../internal/callHandler");
var HtmlLinkParser = require("../internal/HtmlLinkParser");
var linkObj        = require("../internal/linkObj");
var parseOptions   = require("../internal/parseOptions");

var UrlChecker = require("./UrlChecker");



function HtmlChecker(options, handlers)
{
	var thisObj = this;
	
	this.active = false;
	this.baseUrl = undefined;
	this.handlers = handlers || {};
	this.linkCount = 0;
	this.options = parseOptions(options);
	
	this.htmlLinkParser = new HtmlLinkParser(this.options,
	{
		link: function(link)
		{
			linkObj.resolve(link, thisObj.baseUrl, thisObj.options);
			
			// If link should be ignored, skip
			if (link.internal===true && thisObj.options.excludeInternalLinks===true) return;
			if (link.samePage===true && thisObj.options.excludeLinksToSamePage===true) return;
			if (thisObj.options.excludedSchemes[link.url.parsed.protocolTruncated] === true) return;
			
			link.html.index = thisObj.linkCount++;
			
			thisObj.urlChecker.enqueue(link);
		},
		complete: function()
		{
			// If no links found
			if (thisObj.linkCount === 0)
			{
				// TODO :: could cause issues since "complete" is asynchronous
				thisObj.active = false;
				
				callHandler.async(thisObj.handlers.complete);
			}
		}
	});
	
	this.urlChecker = new UrlChecker(this.options,
	{
		link: function(result)
		{
			callHandler.sync(thisObj.handlers.link, result);
		},
		queueComplete: function()
		{
			thisObj.active = false;
			
			// TODO :: what if stream not finished?
			callHandler.sync(thisObj.handlers.complete);
		}
	});
}



HtmlChecker.prototype.scan = function(htmlString, baseUrl)
{
	if (this.active === false)
	{
		this.active = true;
		this.baseUrl = baseUrl;
		this.linkCount = 0;
		
		this.htmlLinkParser.parse(htmlString);
		
		return true;
	}
	else
	{
		return false;
	}
};



module.exports = HtmlChecker;
