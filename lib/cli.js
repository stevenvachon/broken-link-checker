/* eslint-disable no-console */
import {BROKEN_REASON, EXCLUDED_REASON, HTML_INDEX, HTTP_RESPONSE_WAS_CACHED, IS_BROKEN, ORIGINAL_URL, REBASED_URL, WAS_EXCLUDED} from "./internal/Link";
import DEFAULT_OPTIONS from "./internal/defaultOptions";
import {END_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT, PAGE_EVENT, QUEUE_EVENT, SITE_EVENT} from "./internal/events";
import Gauge from "gauge";
import {GET_METHOD} from "./internal/methods";
import {gray, green, red, white, yellow} from "chalk";
import {HtmlUrlChecker, SiteChecker} from "./";
import humanizeDuration from "humanize-duration";
import longest from "longest";
import {make_scanner as scanKeys} from "keyscan";
import notifier from "node-notifier";
import stripAnsi from "strip-ansi";
import supportsSemigraphics from "supports-semigraphics";
import {themes as gaugeThemes} from "gauge/themes";
import {version as packageVersion} from "../package.json";



const title = "Broken Link Checker";
let checker,checkerOptions,gauge,keyScanner,logOptions,pauseMessage,spinner,stats,urls;



const argsToOptions = args =>
{
	const renames =
	{
		exclude: "excludedKeywords",
		excludeExternal: "excludeExternalLinks",
		excludeInternal: "excludeInternalLinks",
		follow: "followRobotExclusions",
		hostRequests: "maxSocketsPerHost",
		include: "includedKeywords",
		ordered: "maintainLinkOrder",
		requests: "maxSockets"
	};

	return Object.entries(args).reduce((opts, [argName, argValue]) =>
	{
		if (argName in renames)
		{
			opts[ renames[argName] ] = argValue;
		}
		else if (argName in DEFAULT_OPTIONS)
		{
			opts[argName] = argValue;
		}
		else if (args.get)
		{
			opts.requestMethod = GET_METHOD;
		}

		return opts;
	}, {});
};



const log = (...args) =>
{
	// Avoid spinner/progress chars getting stuck in the log
	gauge.hide();

	console.log(...args);

	gauge.show();
};



log.page = pageURL =>
{
	log( white("\nGetting links from: ") + yellow(pageURL) );
};



log.page.metrics = () =>
{
	let output = gray(`Finished! ${stats.page.totalLinks} links found.`);

	if (stats.page.skippedLinks > 0)
	{
		output += gray(` ${stats.page.skippedLinks} skipped.`);
	}

	if (stats.page.totalLinks > 0)
	{
		output += gray(" ");

		if (stats.page.brokenLinks > 0)
		{
			output += red(`${stats.page.brokenLinks} broken`);
		}
		else
		{
			output += green(`${stats.page.brokenLinks} broken`);
		}

		output += gray(".");
	}

	log(output);
};



log.progress = () =>
{
	const links = checker.numActiveLinks + checker.numQueuedLinks;

	const pageCompletion = links>0 ? 1/links : 0;

	if (logOptions.recursive)
	{
		gauge.show(`Links:${links} Pages:${checker.numPages} Sites:${checker.numSites}`, pageCompletion);
	}
	else
	{
		gauge.show(`Links:${links} Pages:${checker.numPages}`, pageCompletion);
	}
};



log.result = /*(*/result/*, finalResult)*/ =>
{
	if (result.displayed)
	{
		// @todo if the last result is skipped, the last RENDERED result will not be "└─"
		let output = gray( /*finalResult!==true ?*/ "├─" /*: "└─"*/ );

		const {link} = result;

		if (link.get(IS_BROKEN))
		{
			output += red("BROKEN");
			output += gray("─ ");
		}
		else if (link.get(WAS_EXCLUDED))
		{
			output += gray("─SKIP── ");
		}
		else
		{
			output += gray("──");
			output += green("OK");
			output += gray("─── ");
		}

		// @todo is ORIGINAL_URL only for invalid links?
		output += yellow( link.get(REBASED_URL) ?? link.get(ORIGINAL_URL) );

		if (link.get(IS_BROKEN))
		{
			output += gray(` (${link.get(BROKEN_REASON)})`);
		}
		else if (link.get(WAS_EXCLUDED))
		{
			output += gray(` (${link.get(EXCLUDED_REASON)})`);
		}
		// Don't display cached message if broken/excluded message is displayed
		else if (link.get(HTTP_RESPONSE_WAS_CACHED))
		{
			output += gray(" (CACHED)");
		}

		log(output);
	}
};



/**
 * Logs links in the order that they are found in their containing HTML
 * document, even if later links receive an earlier response.
 */
log.results = () =>
{
	// eslint-disable-next-line no-constant-condition
	while (true)
	{
		const result = stats.page.results[stats.page.currentIndex];

		if (result !== undefined)
		{
			//const final = stats.page.currentIndex>=stats.page.results.length-1 && checker.numActiveLinks===0 && checker.numQueuedLinks===0;

			log.result(result/*, final*/);

			stats.page.currentIndex++;
		}
		else
		{
			break;
		}
	}
};



log.site = () =>
{
	let output = "";

	if (++stats.site.totalPages > 1)
	{
		output += "\n";
	}

	output += white("\nStarting recursive scan...");

	log(output);
};



// @todo number of unique/uncached links
// @todo "excluded links" [from cli] doesn't make sense with a value of 0 when there're skipped links in the log
log.site.metrics = () =>
{
	let output = "";
	output += gray(`\nLinks found: ${stats.site.totalLinks}`);
	output += gray(`\nLinks skipped: ${stats.site.skippedLinks}`);
	output += gray(`\nLinks OK: ${stats.site.totalLinks - stats.site.skippedLinks - stats.site.brokenLinks}`);

	let broken;

	if (stats.site.totalLinks > 0)
	{
		broken = stats.site.brokenLinks>0 ? red : green;
	}
	else
	{
		broken = gray;
	}

	output += broken(`\nLinks broken: ${stats.site.brokenLinks}`);
	output += gray("\nTime elapsed: ");
	output += gray( humanizeDuration(Date.now() - stats.site.startTime, {largest:2, round:true}) );

	const separator = gray("=".repeat( longest(stripAnsi(output).split("\n")).length ));

	log(`\n${separator}${output}\n${separator}\n`);
};



const run = () =>
{
	Object.values(gaugeThemes).forEach(theme =>
	{
		//theme.preProgressbar = `\n\n${theme.preProgressbar}`;
		theme.preSubsection = gray("—");
	});

	gauge = new Gauge();
	stats = new Statistics();

	if (logOptions.recursive)
	{
		checker = new SiteChecker(checkerOptions);
	}
	else
	{
		checker = new HtmlUrlChecker(checkerOptions);
	}

	checker
	.on(HTML_EVENT, (tree, robots, response, pageURL) =>
	{
		log.page(pageURL);
	})
	.on(QUEUE_EVENT, () =>
	{
		log.progress();
	})
	.on(JUNK_EVENT, link =>
	{
		stats.pushResult(link);
		log.progress();
		log.results();
	})
	.on(LINK_EVENT, link =>
	{
		stats.pushResult(link);
		log.progress();
		log.results();
	})
	.on(PAGE_EVENT, (error, pageURL) =>
	{
		if (error != null)
		{
			// HTML_EVENT will not have been called
			log.page(pageURL);

			if (error.code<200 || error.code>299)
			{
				log( red(`${error.name}: ${error.message}`) );
			}
			else
			{
				log( gray(`${error.name}: ${error.message}`) );
			}

			process.exitCode = 1;
		}
		// If more than a total of one page will be scanned
		else if (logOptions.recursive || urls.length>1)
		{
			log.page.metrics();
			log.progress();
			stats.resetPage();

			// If nothing after current page
			if (checker.numPages === 1)
			{
				log.site.metrics();
			}
		}
		else
		{
			log.site.metrics();
		}
	})
	.on(SITE_EVENT, () =>
	{
		log.site.metrics();
		stats.resetSite();
	})
	.on(END_EVENT, () =>
	{
		// @todo store multiple site stats in an array and log all site metrics at very end?

		if (supportsSemigraphics())
		{
			// Exit gracefully
			clearTimeout(spinner);
			gauge.disable();
			keyScanner.release();

			// @todo https://github.com/mikaelbr/node-notifier/issues/174
			notifier.notify({ message:"Finished!", title });
		}
	})
	.on(ERROR_EVENT, error =>
	{
		console.error(error);

		// eslint-disable-next-line no-process-exit
		process.exit(1);
	});

	if (logOptions.recursive)
	{
		log.site();
	}

	if (supportsSemigraphics())
	{
		// Show pause message
		togglePause(false);

		keyScanner = scanKeys(key =>
		{
			if (key.parsed === "space")
			{
				togglePause();
			}
		});
	}
	else
	{
		gauge.disable();
	}

	try
	{
		checker.pause();  // avoid auto-start
		urls.forEach(url => checker.enqueue(new URL(url)));
		checker.resume();  // start, if above didn't throw
	}
	catch ({message})
	{
		console.error(message);
		process.exitCode = 1;
	}
};



const spinnerInterval = () =>
{
	spinner = setTimeout(() =>
	{
		gauge.pulse(pauseMessage);
		spinnerInterval();
	}, 50);
};



class Statistics
{
	constructor()
	{
		this.page = {};
		this.site = {};
		this.resetSite();
	}

	pushResult(link)
	{
		const result = { displayed:true, link };

		const hideCachedLink   = logOptions.hideCachedLinks   && link.get(IS_BROKEN)===false && link.get(HTTP_RESPONSE_WAS_CACHED);
		const hideSkippedLink  = logOptions.hideSkippedLinks  && link.get(WAS_EXCLUDED);
		const hideUnbrokenLink = logOptions.hideUnbrokenLinks && link.get(IS_BROKEN)===false;

		if (hideCachedLink || hideSkippedLink || hideUnbrokenLink)
		{
			this.page.hiddenLinks++;
			this.site.hiddenLinks++;
			result.displayed = false;
		}

		if (link.get(IS_BROKEN))
		{
			this.page.brokenLinks++;
			this.site.brokenLinks++;
			process.exitCode = 1;
		}
		else if (link.get(WAS_EXCLUDED))
		{
			this.page.skippedLinks++;
			this.site.skippedLinks++;
		}

		this.page.totalLinks++;
		this.site.totalLinks++;

		if (logOptions.maintainLinkOrder)
		{
			this.page.results[link.get(HTML_INDEX)] = result;
		}
		else
		{
			this.page.results.push(result);
		}
	}

	resetPage()
	{
		this.page.brokenLinks = 0;
		this.page.currentIndex = 0;
		this.page.hiddenLinks = 0;
		this.page.results = [];
		this.page.skippedLinks = 0;
		//this.page.startTime = Date.now();
		this.page.totalLinks = 0;
	}

	resetSite()
	{
		this.resetPage();
		this.site.brokenLinks = 0;
		this.site.hiddenLinks = 0;
		this.site.skippedLinks = 0;
		this.site.startTime = Date.now();
		this.site.totalLinks = 0;
		this.site.totalPages = 0;
	}
}



const togglePause = pause =>
{
	if (pause === undefined)
	{
		pause = !checker.isPaused;
	}

	if (pause)
	{
		checker.pause();

		pauseMessage = `${yellow("PAUSED")}${gray(" — press space to resume")}`;
		gauge.pulse(pauseMessage);
		clearTimeout(spinner);
	}
	else
	{
		checker.resume();

		pauseMessage = gray("press space to pause");
		spinner = spinnerInterval();
	}

	log.progress();
};



export default (args=process.argv) =>
{
	const filterLevel =
	[
		"--filter-level:",
		"  0: clickable links",
		"  1: 0 + media, frames, meta refreshes",
		"  2: 1 + stylesheets, scripts, forms",
		"  3: 2 + metadata"
	].join("\n");

	const verbosity =
	[
		"--verbosity:",
		"  0: broken links",
		"  1: 0 + unbroken links",
		"  2: 1 + skipped links"
	].join("\n");

	/* eslint-disable sort-keys */
	const optionator = require("optionator")(
	{
		prepend: `${yellow(title.toUpperCase())}\n\n${green("Usage:")} blc [options] url1 [url2 ...]`,
		append: `${gray(filterLevel)}\n\n${gray(verbosity)}\n`,
		options:
		[
			{ heading:"Common Options" },
			{ option:"recursive",        alias:"r", type:"Boolean",  description:`Recursively scan ("crawl") the HTML document(s)`,                   default:"false" },

			{ heading:"Filtering Options" },
			{ option:"exclude",                     type:"[String]", description:"Skip checking of links that match keywords/glob" },
			{ option:"exclude-external", alias:"e", type:"Boolean",  description:"Skip checking of external links",                                   default:"false" },
			{ option:"exclude-internal", alias:"i", type:"Boolean",  description:"Skip checking of internal links",                                   default:"false" },
			{ option:"filter-level",                type:"Number",   description:"Include checking of links by HTML properties",                      default:`${DEFAULT_OPTIONS.filterLevel}` },
			{ option:"follow",           alias:"f", type:"Boolean",  description:"Force-follow robot exclusions",                                     default:"false" },
			{ option:"include",                     type:"[String]", description:"Only check links that match keywords/glob" },

			{ heading:"Display Options" },
			{ option:"help",             alias:"h", type:"Boolean",  description:"Display this help text",                                            default:"false" },
			{ option:"ordered",          alias:"o", type:"Boolean",  description:"Maintain the order of links as they appear in their HTML document", default:"false" },
			{ option:"verbosity",                   type:"Number",   description:"The display verbosity level",                                       default:"1" },
			{ option:"version",          alias:"v", type:"Boolean",  description:"Display the app version",                                           default:"false" },

			{ heading:"Advanced Options" },
			{ option:"get",              alias:"g", type:"Boolean",  description:"Change request method to GET",                                      default:"false" },
			{ option:"host-requests",               type:"Number",   description:"Concurrent requests limit per host",                                default:`${DEFAULT_OPTIONS.maxSocketsPerHost}` },
			{ option:"requests",                    type:"Number",   description:"Concurrent requests limit ",                                        default:`${DEFAULT_OPTIONS.maxSockets}` },
			{ option:"user-agent",                  type:"String",   description:"The user agent to use for checking links" }
		]
	});
	/* eslint-disable sort-keys */

	try
	{
		if (args === process.argv)
		{
			args = optionator.parseArgv(args);
		}
		else
		{
			args = optionator.parse(args);
		}
	}
	catch (error)
	{
		args = error;
	}

	if (args instanceof Error)
	{
		console.error(args.message);
		process.exitCode = 1;
	}
	else if (args.help)
	{
		console.log( optionator.generateHelp() );
	}
	else if (args.version)
	{
		console.log(packageVersion);
	}
	else if (args._.length > 0)
	{
		urls = args._;
		checkerOptions = argsToOptions(args);
		logOptions =
		{
			hideCachedLinks:   args.verbosity < 2,
			hideSkippedLinks:  args.verbosity < 2,
			hideUnbrokenLinks: args.verbosity < 1,
			maintainLinkOrder: args.ordered,
			recursive:         args.recursive === true  // default value is undefined
		};

		run();
	}
	else
	{
		console.error("At least one URL is required - see '--help'");
		process.exitCode = 1;
	}
};
