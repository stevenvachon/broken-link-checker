"use strict";
var getRobotsTxt = require("../internal/getRobotsTxt");
var matchUrl     = require("../internal/matchUrl");
var parseOptions = require("../internal/parseOptions");

var HtmlUrlChecker = require("./HtmlUrlChecker");

var maybeCallback = require("maybe-callback");
var RequestQueue = require("limited-request-queue");
var UrlCache = require("urlcache");



function SiteChecker(options, handlers)
{
	var thisObj = this;
	
	reset(this);
	
	this.handlers = handlers || {};
	this.options = options = parseOptions(options);
	
	this.sitePagesChecked = new UrlCache({ expiryTime: this.options.cacheExpiryTime });
	
	this.siteUrlQueue = new RequestQueue(
	{
		maxSockets: 1,
		rateLimit: this.options.rateLimit
	},
	{
		item: function(input, done)
		{
			thisObj.currentCustomData = input.data.customData;
			thisObj.currentDone = done;
			thisObj.currentSiteUrl = input.url;  // TODO :: strip beyond domain?
			
			// Support checking sites multiple times
			thisObj.sitePagesChecked.clear();
			
			if (options.honorDisallowed === true)
			{
				getRobotsTxt(thisObj.currentSiteUrl, options).then( function(data)
				{
					thisObj.currentRobotsTxt = data.guard;
					
					// Internal event (undocumented)
					maybeCallback(thisObj.handlers.robots)(data.data);
				/*})
				.catch( function(error)
				{
					// Internal event (undocumented)
					maybeCallback(thisObj.handlers.robots)(null);
				})
				.then( function()
				{*/
					enqueuePage(thisObj, thisObj.currentSiteUrl, thisObj.currentCustomData);
				});
			}
			else
			{
				enqueuePage(thisObj, thisObj.currentSiteUrl, thisObj.currentCustomData);
			}
		},
		end: function()
		{
			// Reduce memory usage
			thisObj.sitePagesChecked.clear();
			
			// Clear references for garbage collection
			reset(thisObj);
			
			maybeCallback(thisObj.handlers.end)();
		}
	});
	
	this.htmlUrlChecker = new HtmlUrlChecker(this.options,
	{
		html: function(pageUrl, customData)
		{
			// Internal event (undocumented)
			maybeCallback(thisObj.handlers.html)(pageUrl, customData);
		},
		junk: function(result, customData)
		{
			maybeCallback(thisObj.handlers.junk)(result, customData);
			
			maybeEnqueuePage(thisObj, result, customData);
		},
		link: function(result, customData)
		{
			maybeCallback(thisObj.handlers.link)(result, customData);
			
			maybeEnqueuePage(thisObj, result, customData);
		},
		page: function(error, pageUrl, customData)
		{
			maybeCallback(thisObj.handlers.page)(error, pageUrl, customData);
			
			// TODO :: will set error if last page among many couldn't load html -- should only do so when it's the first page of the site
			thisObj.currentPageError = error;
		},
		end: function()
		{
			maybeCallback(thisObj.handlers.site)(thisObj.currentPageError, thisObj.currentSiteUrl, thisObj.currentCustomData);
			
			// Auto-starts next site, if any
			// If not, fires "end"
			thisObj.currentDone();
		}
	});
}



SiteChecker.prototype.clearCache = function()
{
	// Does not clear `sitePagesChecked` because it would mess up any current scans
	return this.htmlUrlChecker.clearCache();
};



SiteChecker.prototype.dequeue = function(id)
{
	return this.siteUrlQueue.dequeue(id);
};



SiteChecker.prototype.enqueue = function(firstPageUrl, customData)
{
	return this.siteUrlQueue.enqueue(
	{
		url: firstPageUrl,
		data: { customData:customData }
	});
};



SiteChecker.prototype.numActiveLinks = function()
{
	return this.htmlUrlChecker.numActiveLinks();
};



SiteChecker.prototype.numQueuedLinks = function()
{
	return this.htmlUrlChecker.numQueuedLinks();
};



SiteChecker.prototype.numSites = function()
{
	return this.siteUrlQueue.length();
};



SiteChecker.prototype.pause = function()
{
	this.htmlUrlChecker.pause();
	return this.siteUrlQueue.pause();
};



SiteChecker.prototype.resume = function()
{
	this.htmlUrlChecker.resume();
	return this.siteUrlQueue.resume();
};



/*SiteChecker.prototype.__getCache = function()
{
	return this.htmlUrlChecker.__getCache();
};*/



//::: PRIVATE FUNCTIONS



function enqueuePage(instance, url, customData)
{
	// Avoid links to self within page
	instance.sitePagesChecked.set(url, true);
	
	instance.htmlUrlChecker.enqueue(url, customData);
}



function maybeEnqueuePage(instance, link, customData)
{
	var attrName;
	var tagName = instance.options.tags.recursive[instance.options.filterLevel][link.html.tagName];
	
	if (tagName != null)
	{
		attrName = tagName[link.html.attrName];
	}
	
	if (
	   	(attrName !== true) ||
	   	(link.broken === true) ||
	   	(link.internal !== true) ||
	   	(instance.options.excludedSchemes[link.url.parsed.extra.protocolTruncated] === true) ||
	   	(instance.options.honorDisallowed===true && link.html.attrs!=null && link.html.attrs.rel!=null && link.html.attrs.rel.split(" ").indexOf("nofollow")>-1) ||
	   	(matchUrl(link.url.resolved, instance.options.excludedKeywords) === true) ||
	   	(instance.sitePagesChecked.get(link.url.resolved) === true) ||
	   	(instance.options.honorDisallowed===true && instance.currentRobotsTxt.isAllowed(instance.options.userAgent, link.pathname)===false)
	   )
	{
		return false;
	}
	
	// TODO :: store ALL redirects in cache
	//instance.sitePagesChecked.set(link.url.original, true);
	
	enqueuePage(instance, link.url.resolved, customData);
	
	return true;
}



function reset(instance)
{
	instance.currentCustomData = null;
	instance.currentDone = null;
	instance.currentPageError = null;
	instance.currentRobotsTxt = null;
	instance.currentSiteUrl = null;
}



module.exports = SiteChecker;
