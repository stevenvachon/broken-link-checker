"use strict";
var linkObj      = require("../internal/linkObj");
var matchUrl     = require("../internal/matchUrl");
var parseHtml    = require("../internal/parseHtml");
var parseOptions = require("../internal/parseOptions");
var scrapeHtml   = require("../internal/scrapeHtml");

var UrlChecker = require("./UrlChecker");

var isString = require("is-string");
var linkTypes = require("link-types").map;
var maybeCallback = require("maybe-callback");
var RobotDirectives = require("robot-directives");



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



HtmlChecker.prototype.scan = function(html, baseUrl, robots)
{
	var tree;
	var thisObj = this;
	
	if (this.active === false)
	{
		// Prevent user error with undocumented arugment
		if (robots instanceof RobotDirectives === false)
		{
			robots = new RobotDirectives({ userAgent: this.options.userAgent });
		}
		
		this.active = true;
		this.baseUrl = baseUrl;
		this.robots = robots;
		
		parseHtml(html).then( function(document)
		{
			tree = document;
			return scrapeHtml(document, thisObj.robots);
		})
		.then( function(links)
		{
			maybeCallback(thisObj.handlers.html)(tree, thisObj.robots);
			
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
	var excludedReason;
	
	linkObj.resolve(link, instance.baseUrl, instance.options);
	
	excludedReason = excludeLink(link, instance);
	
	if (excludedReason !== false)
	{
		link.html.offsetIndex = instance.excludedLinks++;
		link.excluded = true;
		link.excludedReason = excludedReason;
		
		linkObj.clean(link);
		
		maybeCallback(instance.handlers.junk)(link);
		
		return;
	}
	
	link.html.offsetIndex = link.html.index - instance.excludedLinks;
	link.excluded = false;
	
	instance.linkEnqueued = instance.urlChecker.enqueue(link);
	
	// TODO :: is this redundant? maybe use `linkObj.invalidate()` in `excludeLink()` ?
	if (instance.linkEnqueued instanceof Error)
	{
		link.broken = true;
		// TODO :: update limited-request-queue to support path-only URLs
		link.brokenReason = instance.linkEnqueued.message==="Invalid URI" ? "BLC_INVALID" : "BLC_UNKNOWN";
		
		linkObj.clean(link);
		
		maybeCallback(instance.handlers.link)(link);
	}
}



function excludeLink(link, instance)
{
	var attrSupported,externalFilter;
	var attrName = link.html.attrName;
	var tagName = link.html.tagName;
	var tagGroup = instance.options.tags[instance.options.filterLevel][tagName];
	
	if (tagGroup != null)
	{
		attrSupported = tagGroup[attrName];
	}
	
	if (attrSupported !== true) return "BLC_HTML";
	if (instance.options.excludeExternalLinks===true   && link.internal===false) return "BLC_EXTERNAL";
	if (instance.options.excludeInternalLinks===true   && link.internal===true)  return "BLC_INTERNAL";
	if (instance.options.excludeLinksToSamePage===true && link.samePage===true)  return "BLC_SAMEPAGE";
	if (instance.options.excludedSchemes[link.url.parsed.extra.protocolTruncated] === true) return "BLC_SCHEME";
	
	if (instance.options.honorRobotExclusions === true)
	{
		if (instance.robots.oneIs([ RobotDirectives.NOFOLLOW, RobotDirectives.NOINDEX ]) === true)
		{
			return "BLC_ROBOTS";
		}
		
		if (instance.robots.is(RobotDirectives.NOIMAGEINDEX) === true)
		{
			if (
			    (tagName==="img"      && attrName==="src"   ) || 
			    (tagName==="input"    && attrName==="src"   ) || 
			    (tagName==="menuitem" && attrName==="icon"  ) || 
			    (tagName==="video"    && attrName==="poster")
			   )
			{
				return "BLC_ROBOTS";
			}
		}
		
		if (link.html.attrs!=null && link.html.attrs.rel!=null && linkTypes(link.html.attrs.rel).nofollow===true)
		{
			return "BLC_ROBOTS";
		}
	}
	
	if (matchUrl(link.url.resolved, instance.options.excludedKeywords) === true) return "BLC_KEYWORD";
	
	// Undocumented handler for custom constraints
	externalFilter = maybeCallback(instance.handlers._filter)(link);
	
	if (isString(externalFilter) === true)
	{
		return externalFilter;
	}
	/*else if (externalFilter === false)
	{
		return "BLC_CUSTOM";
	}*/
	
	return false;
}



function reset(instance)
{
	instance.active = false;
	instance.baseUrl = undefined;
	instance.excludedLinks = 0;
	instance.linkEnqueued = null;
	instance.parsed = false;
	instance.robots = null;
}



module.exports = HtmlChecker;
