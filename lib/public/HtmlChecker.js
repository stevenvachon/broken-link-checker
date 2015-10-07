"use strict";
var HtmlLinkParser = require("../internal/HtmlLinkParser");
var linkObj        = require("../internal/linkObj");
var matchUrl       = require("../internal/matchUrl");
var parseOptions   = require("../internal/parseOptions");

var UrlChecker = require("./UrlChecker");

var maybeCallback = require("maybe-callback");



function HtmlChecker(options, handlers)
{
	var thisObj = this;
	
	reset(this);
	
	this.handlers = handlers || {};
	this.options = parseOptions(options);
	
	this.htmlLinkParser = new HtmlLinkParser(this.options,
	{
		link: function(link)
		{
			linkObj.resolve(link, thisObj.baseUrl, thisObj.options);
			
			if (excludeLink(link, thisObj) === true)
			{
				link.html.offsetIndex = thisObj.excludedLinks++;
				link.excluded = true;
				
				linkObj.clean(link);
				
				maybeCallback(thisObj.handlers.junk)(link);
				
				return;
			}
			
			link.html.offsetIndex = link.html.index - thisObj.excludedLinks;
			link.excluded = false;
			
			thisObj.linkEnqueued = thisObj.urlChecker.enqueue(link);
			
			if (thisObj.linkEnqueued instanceof Error)
			{
				linkObj.broken(link, thisObj.linkEnqueued);
				
				maybeCallback(thisObj.handlers.link)(link);
			}
		},
		complete: function()
		{
			thisObj.parsed = true;
			
			// If no links found or all links already checked
			if (thisObj.urlChecker.length()===0 && thisObj.urlChecker.numActive()===0)
			{
				maybeCallback(complete)(thisObj);
			}
		}
	});
	
	this.urlChecker = new UrlChecker(this.options,
	{
		link: function(result)
		{
			maybeCallback(thisObj.handlers.link)(result);
		},
		end: function()
		{
			// If stream finished
			if (thisObj.parsed === true)
			{
				maybeCallback(complete)(thisObj);
			}
		}
	});
}



HtmlChecker.prototype.clearCache = function()
{
	return this.urlChecker.clearCache();
};



HtmlChecker.prototype.numActive = function()
{
	return this.urlChecker.numActive();
};



HtmlChecker.prototype.pause = function()
{
	return this.urlChecker.pause();
};



HtmlChecker.prototype.resume = function()
{
	return this.urlChecker.resume();
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



HtmlChecker.prototype.__getCache = function()
{
	return this.urlChecker.__getCache();
};



//::: PRIVATE FUNCTIONS



function complete(instance)
{
	reset(instance);
	
	maybeCallback(instance.handlers.complete)();
}



function excludeLink(link, instance)
{
	var attrName;
	var tagName = instance.options.tags[instance.options.filterLevel][link.html.tagName];
	
	if (tagName != null)
	{
		attrName = tagName[link.html.attrName];
	}
	
	if (
	   	(attrName !== true) || // TODO :: move tag/attr filtering back to HtmlLinkParser and add a "junk" handler to it
	   	(instance.options.excludeExternalLinks===true   && link.internal===false) ||
	   	(instance.options.excludeInternalLinks===true   && link.internal===true) ||
	   	(instance.options.excludeLinksToSamePage===true && link.samePage===true) ||
	   	(instance.options.excludedSchemes[link.url.parsed.extra.protocolTruncated] === true) ||
	   	( matchUrl(link.url.resolved, instance.options.excludedKeywords) === true )
	   )
	{
		return true;
	}
	
	return false;
}



function reset(instance)
{
	instance.active = false;
	instance.baseUrl = undefined;
	instance.excludedLinks = 0;
	instance.linkEnqueued = null;
	instance.parsed = false;
}



module.exports = HtmlChecker;
