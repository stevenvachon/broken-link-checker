"use strict";
const Link           = require("../internal/Link");
const matchUrl       = require("../internal/matchUrl");
const parseHtml      = require("../internal/parseHtml");
const parseOptions   = require("../internal/parseOptions");
const scrapeHtml     = require("../internal/scrapeHtml");
const transitiveAuth = require("../internal/transitiveAuth");

const UrlChecker = require("./UrlChecker");

const {EventEmitter} = require("events");
const isObject = require("is-object");
const {map:linkTypes} = require("link-types");
const promiseTry = require("es6-promise-try");
const RobotDirectives = require("robot-directives");



class HtmlChecker extends EventEmitter
{
	constructor(options)
	{
		super();
		reset(this);

		this.options = parseOptions(options);

		this.urlChecker = new UrlChecker(this.options)
		.on("error", error => this.emit("error", error))
		.on("queue", () => this.emit("queue"))
		.on("link", result => this.emit("link", result))
		.on("end", () => complete(this));
	}



	clearCache()
	{
		this.urlChecker.clearCache();
		return this;
	}



	get isPaused()
	{
		return this.urlChecker.isPaused;
	}



	get numActiveLinks()
	{
		return this.urlChecker.numActiveLinks;
	}



	get numQueuedLinks()
	{
		return this.urlChecker.numQueuedLinks;
	}



	pause()
	{
		this.urlChecker.pause();
		return this;
	}



	resume()
	{
		this.urlChecker.resume();
		return this;
	}



	// `robots` and `auth` are undocumented and for internal use only
	scan(html, baseUrl, robots, auth)
	{
		return promiseTry(() =>
		{
			if (!this.scanning)
			{
				// Prevent user error with missing undocumented arugment
				if (!(robots instanceof RobotDirectives))
				{
					robots = new RobotDirectives({ userAgent: this.options.userAgent });
				}

				const transitive = transitiveAuth(baseUrl, auth);

				this.auth = transitive.auth;
				this.baseUrl = transitive.url;  // TODO :: remove hash (and store somewhere?)
				this.robots = robots;
				this.scanning = true;

				let tree;

				return parseHtml(html)
				.then(document =>
				{
					tree = document;
					return scrapeHtml(document, this.baseUrl, this.robots);  // TODO :: add auth?
				})
				.then(links => new Promise(resolve =>
				{
					this.emit("html", tree, this.robots);

					links.forEach(link => maybeEnqueueLink(this, link));

					// For external resolution
					this.resolvePromise = resolve;

					// If no links found or all links already checked
					if (this.urlChecker.numActiveLinks===0 && this.urlChecker.numQueuedLinks===0)
					{
						complete(this);
					}
				}))
				.catch(error => this.emit("error", error));
			}
			else
			{
				throw new Error("Scan already in progress");
			}
		});
	}



	__getCache()
	{
		return this.urlChecker.__getCache();
	}
}



//::: PRIVATE FUNCTIONS



function complete(instance)
{
	const resolvePromise = instance.resolvePromise;

	reset(instance);

	instance.emit("complete");

	resolvePromise();
}



function isRobotAttr(tagName, attrName)
{
	return (tagName==="img"      && attrName==="src"   ) ||
	       (tagName==="input"    && attrName==="src"   ) ||
	       (tagName==="menuitem" && attrName==="icon"  ) ||
	       (tagName==="video"    && attrName==="poster");
}



function maybeEnqueueLink(instance, link)
{
	if (link.url.rebased === null)
	{
		link.html.offsetIndex = link.html.index - instance.excludedLinks;
		link.broken = true;
		link.brokenReason = "BLC_INVALID";
		link.excluded = false;

		instance.emit("link", link);
	}
	else
	{
		const excludedReason = maybeExcludeLink(instance, link);

		if (excludedReason === undefined)
		{
			link.html.offsetIndex = link.html.index - instance.excludedLinks;
			link.excluded = false;

			instance.urlChecker.enqueue(link, null, instance.auth);
		}
		else
		{
			link.html.offsetIndex = instance.excludedLinks++;
			link.excluded = true;
			link.excludedReason = excludedReason;

			instance.emit("junk", link);
		}
	}
}



function maybeExcludeLink(instance, link)
{
	const options = instance.options;
	const attrName = link.html.attrName;
	const tagName = link.html.tagName;
	const tags = options.tags[options.filterLevel];

	if ((tags[tagName]===undefined || tags[tagName][attrName]===undefined) && (tags["*"]===undefined || tags["*"][attrName]===undefined))
	{
		return "BLC_HTML";
	}
	else if (options.excludeExternalLinks && link.internal===false)
	{
		return "BLC_EXTERNAL";
	}
	else if (options.excludeInternalLinks && link.internal)
	{
		return "BLC_INTERNAL";
	}
	else if (options.excludeLinksToSamePage && link.samePage)
	{
		return "BLC_SAMEPAGE";
	}
	else if (options.excludedSchemes[link.url.rebased.protocol])
	{
		return "BLC_SCHEME";
	}
	else if (options.honorRobotExclusions && instance.robots.oneIs([ RobotDirectives.NOFOLLOW, RobotDirectives.NOINDEX ]))
	{
		return "BLC_ROBOTS";
	}
	else if (options.honorRobotExclusions && instance.robots.is(RobotDirectives.NOIMAGEINDEX) && isRobotAttr(tagName, attrName))
	{
		return "BLC_ROBOTS";
	}
	else if (options.honorRobotExclusions && link.html.attrs!=null && link.html.attrs.rel!=null && linkTypes(link.html.attrs.rel).nofollow)
	{
		return "BLC_ROBOTS";
	}
	else if (matchUrl(link.url.rebased.href, options.excludedKeywords))
	{
		return "BLC_KEYWORD";
	}
	else
	{
		const filter = options.customFilter(link);

		// Undocumented support for objects (from `SiteChecker`)
		if (isObject(filter) && "excludedReason" in filter)
		{
			return filter.excludedReason;
		}
		else if (!filter)
		{
			return "BLC_CUSTOM";
		}
	}
}



function reset(instance)
{
	instance.auth = null;
	instance.baseUrl = undefined;
	instance.excludedLinks = 0;
	instance.linkEnqueued = null;
	instance.resolvePromise = null;
	instance.robots = null;
	instance.scanning = false;
}



module.exports = HtmlChecker;
