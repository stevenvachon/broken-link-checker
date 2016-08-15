import * as Link from "../internal/Link";
import {COMPLETE_EVENT, END_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT, QUEUE_EVENT} from "../internal/events";
import {EventEmitter} from "events";
import isString from "is-string";
import {map as linkTypes} from "link-types";
import matchUrl from "../internal/matchUrl";
import parseHtml from "../internal/parseHtml";
import parseOptions from "../internal/parseOptions";
import {reasons} from "../internal/messages";
import RobotDirectives from "robot-directives";
import scrapeHtml from "../internal/scrapeHtml";
import transitiveAuth from "../internal/transitiveAuth";
import UrlChecker from "./UrlChecker";



export default class HtmlChecker extends EventEmitter
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



	#isExcludedAttribute(attrName, tagNames)
	{
		const tagGroups = this.#options.tags[this.#options.filterLevel];

		return tagNames.every(tagName => !(tagName in tagGroups) || !(attrName in tagGroups[tagName]));
	}



	get isPaused()
	{
		return this.#urlChecker.isPaused;
	}



	#maybeEnqueueLink(link)
	{
		if (link.url.rebased === null)
		{
			Link.setBroken(link, "BLC_INVALID");

			link.html.offsetIndex = link.html.index - this.#excludedLinks;
			link.excluded = false;

			this.emit(LINK_EVENT, link);
		}
		else
		{
			const excludedReason = this.#maybeExcludeLink(link);

			if (excludedReason === undefined)
			{
				link.html.offsetIndex = link.html.index - this.#excludedLinks;
				link.excluded = false;

				this.#urlChecker.enqueue(link, null, this.#auth);
			}
			else
			{
				link.html.offsetIndex = this.#excludedLinks++;
				link.excluded = true;
				link.excludedReason = excludedReason;

				this.emit(JUNK_EVENT, link);
			}
		}
	}



	#maybeExcludeLink(link)
	{
		const {attrName, attrs, tagName} = link.html;
		const {rebased:rebasedUrl} = link.url;

		const
		{
			customFilter,
			excludedKeywords,
			excludedSchemes,
			excludeExternalLinks,
			excludeInternalLinks,
			excludeLinksToSamePage,
			honorRobotExclusions
		} = this.#options;

		if (this.#isExcludedAttribute(attrName, [tagName, "*"]))
		{
			return "BLC_HTML";
		}
		else if (excludeExternalLinks && link.internal===false)
		{
			return "BLC_EXTERNAL";
		}
		else if (excludeInternalLinks && link.internal)
		{
			return "BLC_INTERNAL";
		}
		else if (excludeLinksToSamePage && link.samePage)
		{
			return "BLC_SAMEPAGE";
		}
		else if (excludedSchemes[rebasedUrl.protocol])
		{
			return "BLC_SCHEME";
		}
		else if (honorRobotExclusions && this.#robots.oneIs([ RobotDirectives.NOFOLLOW, RobotDirectives.NOINDEX ]))
		{
			return "BLC_ROBOTS";
		}
		else if (honorRobotExclusions && this.#robots.is(RobotDirectives.NOIMAGEINDEX) && isRobotAttr(tagName, attrName))
		{
			return "BLC_ROBOTS";
		}
		else if (honorRobotExclusions && attrs?.rel!=null && linkTypes(attrs.rel).nofollow)
		{
			return "BLC_ROBOTS";
		}
		else if (matchUrl(rebasedUrl.href, excludedKeywords))
		{
			return "BLC_KEYWORD";
		}
		else
		{
			const filterResult = customFilter(link);

			// Undocumented support for strings (from `SiteChecker`)
			if (isString(filterResult) && filterResult in reasons)
			{
				return filterResult;
			}
			else if (!filterResult)
			{
				return "BLC_CUSTOM";
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
	async scan(html, baseUrl, robots, auth)
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

			const transitive = transitiveAuth(baseUrl, auth);

			baseUrl = transitive.url;  // TODO :: remove hash (and store somewhere?)

			this.#auth = transitive.auth;
			this.#robots = robots;
			this.#scanning = true;

			try
			{
				const document = await parseHtml(html);
				const links = scrapeHtml(document, baseUrl, this.#robots);  // TODO :: add auth?

				this.emit(HTML_EVENT, document, this.#robots);

				links.forEach(link => this.#maybeEnqueueLink(link));

				const resolveOnComplete = new Promise(resolve => this.#resolvePromise = resolve);

				// If no links found or all links already checked
				if (this.#urlChecker.numActiveLinks===0 && this.#urlChecker.numQueuedLinks===0)
				{
					this.#complete(this);
				}

				return resolveOnComplete;
			}
			catch (error)
			{
				this.emit(ERROR_EVENT, error);
			}
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
