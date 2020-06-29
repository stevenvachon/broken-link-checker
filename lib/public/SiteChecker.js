"use strict";
var getRobotsTxt = require("../internal/getRobotsTxt");
var matchUrl     = require("../internal/matchUrl");
var parseOptions = require("../internal/parseOptions");
var reasons      = require("../internal/messages").reasons;

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
			thisObj.currentSiteUrl = input.url;  // TODO :: strip after hostname?
			
			// Support checking sites multiple times
			thisObj.sitePagesChecked.clear();
			
			if (options.honorRobotExclusions === true)
			{
				getRobotsTxt(thisObj.currentSiteUrl, options).then( function(robots)
				{
					thisObj.currentRobotsTxt = robots;
					
					maybeCallback(thisObj.handlers.robots)(robots, thisObj.currentCustomData);
				/*})
				.catch( function(error)
				{
					maybeCallback(thisObj.handlers.robots)(error, null);
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
		html: function(tree, robots, response, pageUrl, customData)
		{
			// If was redirected
			if (response.url !== pageUrl)
			{
				thisObj.sitePagesChecked.set(response.url, true);
				
				for (var i=0; i<response.redirects.length; i++)
				{
					// Avoid rechecking any redirected pages
					thisObj.sitePagesChecked.set( response.redirects[i].url, true );
				}
			}
			
			maybeCallback(thisObj.handlers.html)(tree, robots, response, pageUrl, customData);
		},
		_filter: function(result)  // undocumented handler
		{
			// Additional filters for excluding links
			return maybeCheckLink(thisObj, result);
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
			
			// Only the first page should supply an error to "site" handler
			if (thisObj.sitePagesChecked.length() <= 1)
			{
				thisObj.currentPageError = error;
			}
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



SiteChecker.prototype.numPages = function()
{
	return this.htmlUrlChecker.numPages();
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



function isAllowed(instance, link)
{
	if (instance.options.honorRobotExclusions===true /*&& instance.currentRobotsTxt!=null*/)
	{
		// TODO :: remove condition when/if `linkObj.invalidate()` is used in `HtmlChecker`
		if (link.url.resolved !== null)
		{
			return instance.currentRobotsTxt.isAllowed(instance.options.userAgent, link.url.parsed.pathname);
		}
	}
	
	return true;
}



function maybeCheckLink(instance, link)
{
	if (link.internal===true && isAllowed(instance, link)===false)
	{
		return "BLC_ROBOTS";
	}
}



function maybeEnqueuePage(instance, link, customData)
{
	var attrSupported,i,redirects,tagGroup;
	
	// Skip specific links that were excluded from checks
	if (link.excluded === true)
	{
		switch (link.excludedReason)
		{
			case "BLC_KEYWORD":
			case "BLC_ROBOTS":  // TODO :: catches rel=nofollow links but will also catch meta/header excluded links -- fine?
			case "BLC_SCHEME":
			{
				return false;
			}
		}
	}
	
	tagGroup = instance.options.tags.recursive[instance.options.filterLevel][link.html.tagName];
	
	if (tagGroup != null)
	{
		attrSupported = tagGroup[link.html.attrName];
	}
	
	if (
	   	(attrSupported !== true) || 
	   	(link.broken === true) || 
	   	(link.internal !== true) || 
	   	(instance.sitePagesChecked.get(link.url.resolved) === true) || 
	   	(isAllowed(instance, link) === false)
	   )
	{
		return false;
	}
	
	if (link.url.redirected!=null && instance.sitePagesChecked.get(link.url.redirected)===true)
	{
		redirects = link.http.response.redirects;
		
		for (i=0; i<redirects.length; i++)
		{
			// Because the final redirected page has already been [recursively] checked,
			// all redirects are stored as pages that have been checked
			instance.sitePagesChecked.set(redirects[i].url, true);
		}
		
		return false;
	}
	
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
