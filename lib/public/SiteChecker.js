import {COMPLETE_EVENT, END_EVENT, ERROR_EVENT, HTML_EVENT, ITEM_EVENT, JUNK_EVENT, LINK_EVENT, PAGE_EVENT, QUEUE_EVENT, ROBOTS_EVENT, SITE_EVENT} from "../internal/events";
import {EventEmitter} from "events";
import getRobotsTxt from "../internal/getRobotsTxt";
import HtmlUrlChecker from "./HtmlUrlChecker";
import matchUrl from "../internal/matchUrl";
import parseOptions from "../internal/parseOptions";
import {reasons} from "../internal/messages";
import RequestQueue from "limited-request-queue";
import transitiveAuth from "../internal/transitiveAuth";
import URLCache from "urlcache";



export default class SiteChecker extends EventEmitter
{
	#currentAuth;
	#currentCustomData;
	#currentDone;
	#currentPageError;
	#currentRobotsTxt;
	#currentSiteUrl;
	#htmlUrlChecker;
	#options;
	#sitePagesChecked;
	#siteUrlQueue;



	constructor(options)
	{
		super();
		this.#options = this.#overrideOptions(parseOptions(options));
		this.#sitePagesChecked = new URLCache({ maxAge: this.#options.cacheMaxAge });
		this.#reset();

		this.#siteUrlQueue = new RequestQueue(
		{
			maxSockets: 1,
			rateLimit: this.#options.rateLimit
		})
		.on(ITEM_EVENT, async (url, data, done) =>
		{
			this.#reset();

			this.#currentAuth = data.auth;
			this.#currentCustomData = data.customData;
			this.#currentDone = done;
			this.#currentSiteUrl = url;  // TODO :: strip after hostname?

			try
			{
				if (this.#options.honorRobotExclusions)
				{
					const robots = await getRobotsTxt(this.#currentSiteUrl, this.#currentAuth, this.__cache, this.#options);

					// This receives an instance even if no robots.txt was found
					this.#currentRobotsTxt = robots;

					this.emit(ROBOTS_EVENT, robots, this.#currentCustomData);
				}
			}
			catch
			{
				// If could not connect to server -- let `HtmlUrlChecker` catch it
			}
			finally
			{
				this.#enqueuePage(this.#currentSiteUrl, this.#currentCustomData, this.#currentAuth);
			}
		})
		.on(END_EVENT, () =>
		{
			// Clear references for garbage collection
			this.#reset();

			this.emit(END_EVENT);
		});

		this.#htmlUrlChecker = new HtmlUrlChecker(this.#options)
		.on(ERROR_EVENT, error => this.emit(ERROR_EVENT, error))
		.on(HTML_EVENT, (tree, robots, response, pageUrl, customData) =>
		{
			// If was redirected
			if (response.url !== pageUrl)
			{
				// TODO :: set value to a reusable `Symbol(true)` to reduce memory usage
				this.#sitePagesChecked.set(response.url, true);

				// Avoid rechecking any redirected pages
				response.redirects.forEach(redirect => this.#sitePagesChecked.set(redirect.url, true));
			}

			this.emit(HTML_EVENT, tree, robots, response, pageUrl, customData);
		})
		.on(QUEUE_EVENT, () => this.emit(QUEUE_EVENT))
		.on(JUNK_EVENT, (result, customData) =>
		{
			this.emit(JUNK_EVENT, result, customData);

			this.#maybeEnqueuePage(result, customData, this.#currentAuth);
		})
		.on(LINK_EVENT, (result, customData) =>
		{
			this.emit(LINK_EVENT, result, customData);

			this.#maybeEnqueuePage(result, customData, this.#currentAuth);
		})
		.on(PAGE_EVENT, (error, pageUrl, customData) =>
		{
			this.emit(PAGE_EVENT, error, pageUrl, customData);

			// Only the first page should supply an error to SITE_EVENT
			if (this.#sitePagesChecked.length <= 1)
			{
				this.#currentPageError = error;
			}
		})
		.on(END_EVENT, () =>
		{
			this.emit(SITE_EVENT, this.#currentPageError, this.#currentSiteUrl, this.#currentCustomData);

			// Auto-starts next site, if any
			// Fires END_EVENT, if not
			this.#currentDone();
		});
	}



	clearCache()
	{
		// Does not clear `sitePagesChecked` because it would mess up any current scans
		this.#htmlUrlChecker.clearCache();
		return this;
	}



	dequeue(id)
	{
		const success = this.#siteUrlQueue.dequeue(id);

		this.emit(QUEUE_EVENT);

		return success;
	}



	enqueue(firstPageUrl, customData)
	{
		const transitive = transitiveAuth(firstPageUrl);

		const success = this.#siteUrlQueue.enqueue(transitive.url, { auth:transitive.auth, customData });

		this.emit(QUEUE_EVENT);

		return success;
	}



	#enqueuePage(url, customData, auth)
	{
		// Avoid links to self within page
		this.#sitePagesChecked.set(url, true);

		this.#htmlUrlChecker.enqueue(url, customData, auth);
	}



	#isAllowed(link)
	{
		if (this.#options.honorRobotExclusions)
		{
			// TODO :: remove condition when/if `Link.invalidate()` is used in `HtmlChecker`
			if (link.url.rebased !== null)
			{
				return this.#currentRobotsTxt.isAllowed(this.#options.userAgent, link.url.rebased.pathname);
			}
		}

		return true;
	}



	get isPaused()
	{
		return this.#htmlUrlChecker.isPaused;
	}



	#maybeCheckLink(link)
	{
		if (link.internal===true && !this.#isAllowed(link))
		{
			return "BLC_ROBOTS";
		}
	}



	#maybeEnqueuePage(link, customData, auth)
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

		const tagGroup = this.#options.tags.recursive[this.#options.filterLevel][link.html.tagName] ?? {};
		const attrSupported = link.html.attrName in tagGroup;

		if (
		   	(!attrSupported) ||
		   	(link.broken === true) ||
		   	(link.internal !== true) ||
		   	(this.#sitePagesChecked.get(link.url.rebased)) ||
		   	(!this.#isAllowed(link))
		   )
		{
			return false;
		}
		else if (link.url.redirected != null)
		{
			// Because only the final redirected page needs to be [recursively] checked,
			// all redirects are stored as pages that have been checked
			link.http.response.redirects.forEach(redirect => this.#sitePagesChecked.set(redirect.url, true));

			if (this.#sitePagesChecked.get(link.url.redirected))
			{
				return false;
			}
			else
			{
				this.#enqueuePage(link.url.redirected, customData, auth);
				return true;
			}
		}
		else
		{
			this.#enqueuePage(link.url.rebased, customData, auth);
			return true;
		}
	}



	get numActiveLinks()
	{
		return this.#htmlUrlChecker.numActiveLinks;
	}



	get numQueuedLinks()
	{
		return this.#htmlUrlChecker.numQueuedLinks;
	}



	get numPages()
	{
		return this.#htmlUrlChecker.numPages;
	}



	get numSites()
	{
		return this.#siteUrlQueue.length;
	}



	#overrideOptions(options)
	{
		const {customFilter} = options;

		options.customFilter = link =>
		{
			const excludedReason = this.#maybeCheckLink(link);

			if (excludedReason === undefined)
			{
				return customFilter(link);
			}
			else
			{
				// Undocumented return value type
				return excludedReason;
			}
		};

		return options;
	}



	pause()
	{
		this.#htmlUrlChecker.pause();
		this.#siteUrlQueue.pause();
		return this;
	}



	#reset()
	{
		this.#currentAuth = null;
		this.#currentCustomData = null;
		this.#currentDone = null;
		this.#currentPageError = null;
		this.#currentRobotsTxt = null;
		this.#currentSiteUrl = null;
		this.#sitePagesChecked.clear();
	}



	resume()
	{
		this.#htmlUrlChecker.resume();
		this.#siteUrlQueue.resume();
		return this;
	}



	// Useless, but consistent with other classes
	get __cache()
	{
		return this.#htmlUrlChecker.__cache;
	}
}
