"use strict";
const getRobotsTxt   = require("../internal/getRobotsTxt");
const matchUrl       = require("../internal/matchUrl");
const parseOptions   = require("../internal/parseOptions");
const {reasons}      = require("../internal/messages");
const transitiveAuth = require("../internal/transitiveAuth");

const HtmlUrlChecker = require("./HtmlUrlChecker");

const {EventEmitter} = require("events");
const RequestQueue = require("limited-request-queue");
const URLCache = require("urlcache");



class SiteChecker extends EventEmitter
{
	constructor(options)
	{
		super();
		reset(this);

		this.options = overrideOptions(this, parseOptions(options));

		this.sitePagesChecked = new URLCache({ maxAge: this.options.cacheMaxAge });

		this.siteUrlQueue = new RequestQueue(
		{
			maxSockets: 1,
			rateLimit: this.options.rateLimit
		})
		.on("item", (url, data, done) =>
		{
			reset(this);

			this.currentAuth = data.auth;
			this.currentCustomData = data.customData;
			this.currentDone = done;
			this.currentSiteUrl = url;  // TODO :: strip after hostname?

			// Support checking sites multiple times
			this.sitePagesChecked.clear();

			if (this.options.honorRobotExclusions === true)
			{
				getRobotsTxt(this.currentSiteUrl/*, this.currentAuth*/, this.options).then(robots =>
				{
					// This receives an instance even if no robots.txt was found
					this.currentRobotsTxt = robots;

					this.emit("robots", robots, this.currentCustomData);

					enqueuePage(this, this.currentSiteUrl, this.currentCustomData, this.currentAuth);
				})
				.catch(error =>
				{
					// If could not connect to server -- let `HtmlUrlChecker` catch it
					enqueuePage(this, this.currentSiteUrl, this.currentCustomData, this.currentAuth);
				});
			}
			else
			{
				enqueuePage(this, this.currentSiteUrl, this.currentCustomData, this.currentAuth);
			}
		})
		.on("end", () =>
		{
			// Reduce memory usage
			this.sitePagesChecked.clear();

			// Clear references for garbage collection
			reset(this);

			this.emit("end");
		});

		this.htmlUrlChecker = new HtmlUrlChecker(this.options)
		.on("error", error => this.emit("error", error))
		.on("html", (tree, robots, response, pageUrl, customData) =>
		{
			// If was redirected
			if (response.url !== pageUrl)
			{
				// TODO :: set value to a reusable `Symbol(true)` to reduce memory usage
				this.sitePagesChecked.set(response.url, true);

				// Avoid rechecking any redirected pages
				response.redirects.forEach(redirect => this.sitePagesChecked.set(redirect.url, true));
			}

			this.emit("html", tree, robots, response, pageUrl, customData);
		})
		.on("queue", () => this.emit("queue"))
		.on("junk", (result, customData) =>
		{
			this.emit("junk", result, customData);

			maybeEnqueuePage(this, result, customData, this.currentAuth);
		})
		.on("link", (result, customData) =>
		{
			this.emit("link", result, customData);

			maybeEnqueuePage(this, result, customData, this.currentAuth);
		})
		.on("page", (error, pageUrl, customData) =>
		{
			this.emit("page", error, pageUrl, customData);

			// Only the first page should supply an error to "site" event
			if (this.sitePagesChecked.length <= 1)
			{
				this.currentPageError = error;
			}
		})
		.on("end", () =>
		{
			this.emit("site", this.currentPageError, this.currentSiteUrl, this.currentCustomData);

			// Auto-starts next site, if any
			// Fires "end", if not
			this.currentDone();
		});
	}



	clearCache()
	{
		// Does not clear `sitePagesChecked` because it would mess up any current scans
		this.htmlUrlChecker.clearCache();
		return this;
	}



	dequeue(id)
	{
		const success = this.siteUrlQueue.dequeue(id);

		this.emit("queue");

		return success;
	}



	enqueue(firstPageUrl, customData)
	{
		const transitive = transitiveAuth(firstPageUrl);

		const success = this.siteUrlQueue.enqueue(transitive.url, { auth:transitive.auth, customData });

		this.emit("queue");

		return success;
	}



	get isPaused()
	{
		return this.htmlUrlChecker.isPaused;
	}



	get numActiveLinks()
	{
		return this.htmlUrlChecker.numActiveLinks;
	}



	get numQueuedLinks()
	{
		return this.htmlUrlChecker.numQueuedLinks;
	}



	get numPages()
	{
		return this.htmlUrlChecker.numPages;
	}



	get numSites()
	{
		return this.siteUrlQueue.length;
	}



	pause()
	{
		this.htmlUrlChecker.pause();
		this.siteUrlQueue.pause();
		return this;
	}



	resume()
	{
		this.htmlUrlChecker.resume();
		this.siteUrlQueue.resume();
		return this;
	}



	/*__getCache()
	{
		return this.htmlUrlChecker.__getCache();
	}*/
}



//::: PRIVATE FUNCTIONS



function enqueuePage(instance, url, customData, auth)
{
	// Avoid links to self within page
	instance.sitePagesChecked.set(url, true);

	instance.htmlUrlChecker.enqueue(url, customData, auth);
}



function isAllowed(instance, link)
{
	if (instance.options.honorRobotExclusions === true)
	{
		// TODO :: remove condition when/if `Link.invalidate()` is used in `HtmlChecker`
		if (link.url.rebased !== null)
		{
			return instance.currentRobotsTxt.isAllowed(instance.options.userAgent, link.url.rebased.pathname);
		}
	}

	return true;
}



function maybeCheckLink(instance, link)
{
	if (link.internal===true && !isAllowed(instance, link))
	{
		return "BLC_ROBOTS";
	}
}



function maybeEnqueuePage(instance, link, customData, auth)
{
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

	const tagGroup = instance.options.tags.recursive[instance.options.filterLevel][link.html.tagName];
	const attrSupported = tagGroup!==undefined ? tagGroup[link.html.attrName]===true : false;

	if (
	   	(!attrSupported) ||
	   	(link.broken === true) ||
	   	(link.internal !== true) ||
	   	(instance.sitePagesChecked.get(link.url.rebased)) ||
	   	(!isAllowed(instance, link))
	   )
	{
		return false;
	}
	else if (link.url.redirected!=null && instance.sitePagesChecked.get(link.url.redirected))
	{
		// Because the final redirected page has already been [recursively] checked,
		// all redirects are stored as pages that have been checked
		link.http.response.redirects.forEach(redirect => instance.sitePagesChecked.set(redirect.url, true));

		return false;
	}
	else
	{
		enqueuePage(instance, link.url.rebased, customData, auth);

		return true;
	}
}



function overrideOptions(instance, options)
{
	const customFilter = options.customFilter;

	options.customFilter = function(result)
	{
		const excludedReason = maybeCheckLink(instance, result);

		if (excludedReason === undefined)
		{
			return customFilter(result);
		}
		else
		{
			// Undocumented return value type
			return { excludedReason };
		}
	};

	return options;
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
