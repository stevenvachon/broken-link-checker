"use strict";
var linkObj      = require("../internal/linkObj");
var matchUrl     = require("../internal/matchUrl");
var parseOptions = require("../internal/parseOptions");
var scrapeHtml   = require("../internal/scrapeHtml");

var UrlChecker = require("./UrlChecker");

var maybeCallback = require("maybe-callback");



function HtmlChecker(options, handlers)
{
	var thisObj = this;
	
	reset(this);
	
	this.handlers = handlers || {};
	this.options = options = parseOptions(options);
	
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
				complete(thisObj);
			}
		}
	});
}



HtmlChecker.prototype.clearCache = function()
{
	return this.urlChecker.clearCache();
};



HtmlChecker.prototype.numActiveLinks = function()
{
	return this.urlChecker.numActiveLinks();
};



HtmlChecker.prototype.numQueuedLinks = function()
{
	return this.urlChecker.numQueuedLinks();
};



HtmlChecker.prototype.pause = function()
{
	return this.urlChecker.pause();
};



HtmlChecker.prototype.resume = function()
{
	return this.urlChecker.resume();
};



HtmlChecker.prototype.scan = function(html, baseUrl)
{
	var thisObj = this;
	
	if (this.active === false)
	{
		this.active = true;
		this.baseUrl = baseUrl;
		
		scrapeHtml(html).then( function(links)
		{
			for (var i=0, numLinks=links.length; i<numLinks; i++)
			{
				enqueueLink(links[i], thisObj);
			}
			
			thisObj.parsed = true;
			
			// If no links found or all links already checked
			if (thisObj.urlChecker.numActiveLinks()===0 && thisObj.urlChecker.numQueuedLinks()===0)
			{
				complete(thisObj);
			}
		});
		
		return true;
	}
	
	return false;
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



function enqueueLink(link, instance)
{
	linkObj.resolve(link, instance.baseUrl, instance.options);
	
	if (excludeLink(link, instance) === true)
	{
		link.html.offsetIndex = instance.excludedLinks++;
		link.excluded = true;
		
		linkObj.clean(link);
		
		maybeCallback(instance.handlers.junk)(link);
		
		return;
	}
	
	link.html.offsetIndex = link.html.index - instance.excludedLinks;
	link.excluded = false;
	
	instance.linkEnqueued = instance.urlChecker.enqueue(link);
	
	if (instance.linkEnqueued instanceof Error)
	{
		linkObj.broken(link, instance.linkEnqueued);
		
		maybeCallback(instance.handlers.link)(link);
	}
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
	   	(attrName !== true) ||
	   	(instance.options.excludeExternalLinks===true   && link.internal===false) ||  // TODO :: `!==true` ?
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
