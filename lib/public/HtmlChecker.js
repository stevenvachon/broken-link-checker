import * as reasons from "../internal/reasons";
import {COMPLETE_EVENT, END_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT, QUEUE_EVENT} from "../internal/events";
import {HTML_ATTR_NAME, HTML_ATTRS, HTML_INDEX, HTML_OFFSET_INDEX, HTML_TAG_NAME, IS_INTERNAL, IS_SAME_PAGE, REBASED_URL} from "../internal/Link";
import isString from "is-string";
import {map as linkTypes} from "link-types";
import matchURL from "../internal/matchURL";
import parseHTML from "../internal/parseHTML";
import parseOptions from "../internal/parseOptions";
import RobotDirectives, {NOFOLLOW, NOIMAGEINDEX, NOINDEX} from "robot-directives";
import SafeEventEmitter from "../internal/SafeEventEmitter";
import scrapeHTML from "../internal/scrapeHTML";
import transitiveAuth from "../internal/transitiveAuth";
import UrlChecker from "./UrlChecker";



export default class HtmlChecker extends SafeEventEmitter
{
	#auth;
	#excludedLinks;
	#options;
	#resolvePromise;
	#robots;
	#scanning;
	#urlChecker;



	constructor(options)
	{
		super();
		this.#options = parseOptions(options);
		this.#reset();

		this.#urlChecker = new UrlChecker(this.#options)
		.on(ERROR_EVENT, error => this.emit(ERROR_EVENT, error))
		.on(QUEUE_EVENT, () => this.emit(QUEUE_EVENT))
		.on(LINK_EVENT, result => this.emit(LINK_EVENT, result))
		.on(END_EVENT, () => this.#complete());
	}



	clearCache()
	{
		this.#urlChecker.clearCache();
		return this;
	}



	#complete()
	{
		const resolvePromise = this.#resolvePromise;

		this.#reset();

		this.emit(COMPLETE_EVENT);

		resolvePromise();
	}



	/**
	 * Determine whether a Link should be excluded from checks, and the reason for such.
	 * @param {Link} link
	 * @returns {string|undefined}
	 */
	#getExcludeReason(link)
	{
		const attrName = link.get(HTML_ATTR_NAME);
		const attrs = link.get(HTML_ATTRS);
		const {href, protocol} = link.get(REBASED_URL);
		const isInternal = link.get(IS_INTERNAL);
		const tagName = link.get(HTML_TAG_NAME);

		const
		{
			excludedKeywords,
			excludedSchemes,
			excludeExternalLinks,
			excludeInternalLinks,
			excludeLinksToSamePage,
			honorRobotExclusions,
			includedKeywords,
			includeLink
		} = this.#options;

		if (this.#isExcludedAttribute(attrName, [tagName, "*"]))
		{
			return "BLC_HTML";
		}
		else if (excludeExternalLinks && isInternal===false)
		{
			return "BLC_EXTERNAL";
		}
		else if (excludeInternalLinks && isInternal)
		{
			return "BLC_INTERNAL";
		}
		else if (excludeLinksToSamePage && link.get(IS_SAME_PAGE))
		{
			return "BLC_SAMEPAGE";
		}
		else if (protocol in excludedSchemes)
		{
			return "BLC_SCHEME";
		}
		else if (honorRobotExclusions && this.#robots.oneIs([ NOFOLLOW, NOINDEX ]))
		{
			return "BLC_ROBOTS";
		}
		else if (honorRobotExclusions && this.#robots.is(NOIMAGEINDEX) && isRobotAttr(tagName, attrName))
		{
			return "BLC_ROBOTS";
		}
		else if (honorRobotExclusions && attrs?.rel!=null && linkTypes(attrs.rel).nofollow)
		{
			return "BLC_ROBOTS";
		}
		else if (matchURL(href, excludedKeywords))
		{
			return "BLC_KEYWORD";
		}
		else if (includedKeywords.length>0 && !matchURL(href, includedKeywords))
		{
			return "BLC_KEYWORD";
		}
		else
		{
			const filterResult = includeLink(link);

			// Undocumented support for strings (from `SiteChecker`)
			if (isString(filterResult) && filterResult in reasons)
			{
				return filterResult;
			}
			else if (!filterResult)
			{
				return "BLC_CUSTOM";
			}
			else
			{
				// Not excluded
			}
		}
	}



	/**
	 * Determine whether a Link's HTML element and attribute would cause it to be excluded from checks.
	 * @param {string} attrName
	 * @param {Array<string>} tagNames
	 * @returns {boolean}
	 */
	#isExcludedAttribute(attrName, tagNames)
	{
		const tagGroups = this.#options.tags[this.#options.filterLevel];

		return tagNames.every(tagName => !(tagName in tagGroups) || !(attrName in tagGroups[tagName]));
	}



	get isPaused()
	{
		return this.#urlChecker.isPaused;
	}



	/**
	 * Enqueue a Link if it is valid and passes filters.
	 * @param {Link} link
	 */
	#maybeEnqueueLink(link)
	{
		if (link.get(REBASED_URL) === null)
		{
			link.set(HTML_OFFSET_INDEX, link.get(HTML_INDEX) - this.#excludedLinks);
			link.break("BLC_INVALID");
			link.include();

			this.emit(LINK_EVENT, link);
		}
		else
		{
			const excludedReason = this.#getExcludeReason(link);

			if (excludedReason === undefined)
			{
				link.set(HTML_OFFSET_INDEX, link.get(HTML_INDEX) - this.#excludedLinks);
				link.include();

				this.#urlChecker.enqueue(link, null, this.#auth);
			}
			else
			{
				link.set(HTML_OFFSET_INDEX, this.#excludedLinks++);
				link.exclude(excludedReason);

				this.emit(JUNK_EVENT, link);
			}
		}
	}



	get numActiveLinks()
	{
		return this.#urlChecker.numActiveLinks;
	}



	get numQueuedLinks()
	{
		return this.#urlChecker.numQueuedLinks;
	}



	pause()
	{
		this.#urlChecker.pause();
		return this;
	}



	#reset()
	{
		this.#auth = null;
		this.#excludedLinks = 0;
		this.#resolvePromise = null;
		this.#robots = null;
		this.#scanning = false;
	}



	resume()
	{
		this.#urlChecker.resume();
		return this;
	}



	// `robots` and `auth` are undocumented and for internal use only
	async scan(html, baseURL, robots, auth)
	{
		if (this.#scanning)
		{
			throw new Error("Scan already in progress");
		}
		else
		{
			// Prevent user error with missing undocumented arugment
			if (!(robots instanceof RobotDirectives))
			{
				robots = new RobotDirectives({ userAgent: this.#options.userAgent });
			}

			const transitive = transitiveAuth(baseURL, auth);

			baseURL = transitive.url;  // @todo remove hash (and store somewhere?)

			this.#auth = transitive.auth;
			this.#robots = robots;
			this.#scanning = true;

			const document = await parseHTML(html);
			const links = scrapeHTML(document, baseURL, this.#robots);  // @todo add auth?

			this.emit(HTML_EVENT, document, this.#robots);

			links.forEach(link => this.#maybeEnqueueLink(link));

			const resolveOnComplete = new Promise(resolve => this.#resolvePromise = resolve);

			// If no links found or all links already checked
			if (this.#urlChecker.numActiveLinks===0 && this.#urlChecker.numQueuedLinks===0)
			{
				this.#complete();
			}

			return resolveOnComplete;
		}
	}



	get __cache()
	{
		return this.#urlChecker.__cache;
	}
}



//::: PRIVATE FUNCTIONS



const isRobotAttr = (tagName, attrName) =>
{
	return (tagName==="img"      && attrName==="src"   ) ||
	       (tagName==="input"    && attrName==="src"   ) ||
	       (tagName==="menuitem" && attrName==="icon"  ) ||
	       (tagName==="video"    && attrName==="poster");
};
