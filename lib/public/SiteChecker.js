import {END_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT, PAGE_EVENT, QUEUE_EVENT, ROBOTS_EVENT, SITE_EVENT} from "../internal/events";
import {EXCLUDED_REASON, HTML_ATTR_NAME, HTML_TAG_NAME, HTTP_RESPONSE, IS_BROKEN, IS_INTERNAL, REBASED_URL, REDIRECTED_URL, WAS_EXCLUDED} from "../internal/Link";
import getRobotsTxt from "../internal/getRobotsTxt";
import HtmlUrlChecker from "./HtmlUrlChecker";
import parseOptions from "../internal/parseOptions";
import RequestQueue, {ITEM_EVENT, END_EVENT as REQUEST_QUEUE_END_EVENT} from "limited-request-queue";
import SafeEventEmitter from "../internal/SafeEventEmitter";
import transitiveAuth from "../internal/transitiveAuth";
import URLCache from "urlcache";



// @todo BLC_ROBOTS catches rel=nofollow links but will also catch meta/header excluded links -- fine?
const PAGE_EXCLUSIONS = ["BLC_KEYWORD", "BLC_ROBOTS", "BLC_SCHEME"];

const PAGE_WAS_CHECKED = true;



export default class SiteChecker extends SafeEventEmitter
{
	#currentAuth;
	#currentCustomData;
	#currentDone;
	#currentPageError;
	#currentRobotsTxt;
	#currentSiteURL;
	#htmlUrlChecker;
	#options;
	#sitePagesChecked;
	#siteUrlQueue;



	constructor(options)
	{
		super();
		this.#options = this.#overrideOptions(parseOptions(options)); // @todo https://github.com/tc39/proposal-pipeline-operator
		this.#sitePagesChecked = new URLCache({ maxAge: this.#options.cacheMaxAge });
		this.#reset();

		this.#siteUrlQueue = new RequestQueue(
		{
			maxSockets: 1,
			rateLimit: this.#options.rateLimit
		})
		.on(ITEM_EVENT, async (url, {auth, customData}, done) =>
		{
			this.#reset();

			this.#currentAuth = auth;
			this.#currentCustomData = customData;
			this.#currentDone = done;
			this.#currentSiteURL = url;  // @todo strip after hostname?

			try
			{
				if (this.#options.honorRobotExclusions)
				{
					const robots = await getRobotsTxt(this.#currentSiteURL, this.#currentAuth, this.__cache, this.#options);

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
				this.#enqueuePage(this.#currentSiteURL, this.#currentCustomData, this.#currentAuth);
			}
		})
		.on(REQUEST_QUEUE_END_EVENT, () =>
		{
			// Clear references for garbage collection
			this.#reset();

			this.emit(END_EVENT);
		});

		this.#htmlUrlChecker = new HtmlUrlChecker(this.#options)
		.on(ERROR_EVENT, error => this.emit(ERROR_EVENT, error))
		.on(HTML_EVENT, (tree, robots, response, pageURL, customData) =>
		{
			// If was redirected
			if (response.url !== pageURL)
			{
				this.#sitePagesChecked.set(response.url, PAGE_WAS_CHECKED);

				// Avoid rechecking any redirected pages
				response.redirects.forEach(redirect => this.#sitePagesChecked.set(redirect.url, PAGE_WAS_CHECKED));
			}

			this.emit(HTML_EVENT, tree, robots, response, pageURL, customData);
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
		.on(PAGE_EVENT, (error, pageURL, customData) =>
		{
			this.emit(PAGE_EVENT, error, pageURL, customData);

			// Only the first page should supply an error to SITE_EVENT
			if (this.#sitePagesChecked.length <= 1)
			{
				this.#currentPageError = error;
			}
		})
		.on(END_EVENT, () =>
		{
			this.emit(SITE_EVENT, this.#currentPageError, this.#currentSiteURL, this.#currentCustomData);

			// Auto-starts next site, if any
			// Emits REQUEST_QUEUE_END_EVENT, if not
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



	enqueue(firstPageURL, customData)
	{
		const transitive = transitiveAuth(firstPageURL);

		const success = this.#siteUrlQueue.enqueue(transitive.url, { auth:transitive.auth, customData });

		this.emit(QUEUE_EVENT);

		return success;
	}



	/**
	 * Enqueue a URL to be crawled.
	 * @param {URL} url
	 * @param {*} customData
	 * @param {object} auth
	 */
	#enqueuePage(url, customData, auth)
	{
		// Avoid links to self within page
		this.#sitePagesChecked.set(url, PAGE_WAS_CHECKED);

		this.#htmlUrlChecker.enqueue(url, customData, auth);
	}



	/**
	 * Determine whether a Link should be excluded from checks, and the reason for such.
	 * @param {Link} link
	 * @returns {string|undefined}
	 */
	#getExcludedReason(link)
	{
		if (link.get(IS_INTERNAL) && !this.#isAllowed(link))
		{
			return "BLC_ROBOTS";
		}
		else
		{
			// Not excluded
		}
	}



	has(id)
	{
		return this.#siteUrlQueue.has(id);
	}



	/**
	 * Determine whether a Link should be included, conforming to any robots filter.
	 * @param {Link} link
	 * @returns {boolean}
	 */
	#isAllowed(link)
	{
		if (this.#options.honorRobotExclusions)
		{
			const rebasedPathname = link.get(REBASED_URL)?.pathname;

			// @todo remove condition when/if `Link::invalidate()` is used in `HtmlChecker`
			if (rebasedPathname !== null)
			{
				return this.#currentRobotsTxt.isAllowed(this.#options.userAgent, rebasedPathname);
			}
			else
			{
				return true;
			}
		}
		else
		{
			return true;
		}
	}



	get isPaused()
	{
		return this.#htmlUrlChecker.isPaused;
	}



	/**
	 * Enqueue a page (to be crawled) if it passes filters.
	 * @param {Link} link
	 * @param {*} customData
	 * @param {object} auth
	 */
	#maybeEnqueuePage(link, customData, auth)
	{
		// Skip specific links that were excluded from checks
		if (link.get(WAS_EXCLUDED) && PAGE_EXCLUSIONS.includes(link.get(EXCLUDED_REASON)))
		{
			// do nothing
		}
		else
		{
			const tagGroup = this.#options.tags.recursive[this.#options.filterLevel][link.get(HTML_TAG_NAME)] ?? {};
			const attrSupported = link.get(HTML_ATTR_NAME) in tagGroup;
			const rebasedURL = link.get(REBASED_URL);
			const redirectedURL = link.get(REDIRECTED_URL);

			if (
			   	!attrSupported ||
			   	link.get(IS_BROKEN) ||
			   	!link.get(IS_INTERNAL) ||
			   	this.#sitePagesChecked.has(rebasedURL) ||
			   	!this.#isAllowed(link)
			   )
			{
				// do nothing
			}
			else if (redirectedURL !== null)
			{
				// Because only the final redirected page needs to be [recursively] checked,
				// all redirects are stored as pages that have been checked
				link.get(HTTP_RESPONSE).redirects.forEach(({url}) => this.#sitePagesChecked.set(url, PAGE_WAS_CHECKED));

				if (!this.#sitePagesChecked.has(redirectedURL))
				{
					this.#enqueuePage(redirectedURL, customData, auth);
				}
			}
			else if (this.#options.includePage(rebasedURL))
			{
				this.#enqueuePage(rebasedURL, customData, auth);
			}
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



	/**
	 * Override/mutate some options for extended behavior.
	 * @param {object} options
	 * @returns {object}
	 */
	#overrideOptions(options)
	{
		const {includeLink} = options;

		options.includeLink = link =>
		{
			const excludedReason = this.#getExcludedReason(link);

			if (excludedReason === undefined)
			{
				return includeLink(link);
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
		this.#currentSiteURL = null;
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
