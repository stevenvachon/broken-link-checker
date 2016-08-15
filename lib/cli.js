"use strict";
const blc            = require("./");
const defaultOptions = require("./internal/defaultOptions");
const pkg            = require("../package.json");

const Gauge = require("gauge");
const {gray, green, red, underline, white, yellow} = require("chalk");
const humanizeDuration = require("humanize-duration");
const longest = require("longest");
const {make_scanner:scanKeys} = require("keyscan");
const notifier = require("node-notifier");
const stripAnsi = require("strip-ansi");
const supportsSemigraphics = require("supports-semigraphics");
const {themes:gaugeThemes} = require("gauge/themes");

const title = "Broken Link Checker";
let checker,checkerOptions,gauge,keyScanner,logOptions,pauseMessage,spinner,stats,urls;



function argsToOptions(args)
{
	const renames =
	{
		exclude: "excludedKeywords",
		excludeExternal: "excludeExternalLinks",
		excludeInternal: "excludeInternalLinks",
		follow: "followRobotExclusions",
		hostRequests: "maxSocketsPerHost",
		ordered: "maintainLinkOrder",
		requests: "maxSockets"
	};

	return Object.keys(args).reduce((opts, arg) =>
	{
		if (arg in renames)
		{
			opts[ renames[arg] ] = args[arg];
		}
		else if (arg in defaultOptions)
		{
			opts[arg] = args[arg];
		}
		else if (args.get)
		{
			opts.requestMethod = "get";
		}

		return opts;
	}, {});
}



function cli(args=process.argv)
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

	const optionator = require("optionator")(
	{
		prepend: `${yellow(title.toUpperCase())}\n\n${green("Usage:")} blc [options] url1 [url2 ...]`,
		append: `${gray(filterLevel)}\n\n${gray(verbosity)}\n`,
		options:
		[
			{ heading:"Common Options" },
			{ option:"recursive",        alias:"r", type:"Boolean",  description:`Recursively scan ("crawl") the HTML document(s)` },

			{ heading:"Filtering Options" },
			{ option:"exclude",                     type:"[String]", description:"Skip checking of links that match keywords/glob" },
			{ option:"exclude-external", alias:"e", type:"Boolean",  description:"Skip checking of external links" },
			{ option:"exclude-internal", alias:"i", type:"Boolean",  description:"Skip checking of internal links" },
			{ option:"filter-level",                type:"Number",   description:"Include checking of links by HTML properties", default:`${defaultOptions.filterLevel}` },
			{ option:"follow",           alias:"f", type:"Boolean",  description:"Force-follow robot exclusions" },

			{ heading:"Display Options" },
			{ option:"help",             alias:"h", type:"Boolean",  description:"Display this help text" },
			{ option:"ordered",          alias:"o", type:"Boolean",  description:"Maintain the order of links as they appear in their HTML document" },
			{ option:"verbosity",                   type:"Number",   description:"Display verbosity level", default:"1" },
			{ option:"version",          alias:"v", type:"Boolean",  description:"Display the app version" },

			{ heading:"Advanced Options" },
			{ option:"get",              alias:"g", type:"Boolean",  description:"Change request method to GET" },
			{ option:"host-requests",               type:"Number",   description:"Concurrent requests limit per host", default:`${defaultOptions.maxSocketsPerHost}` },
			{ option:"requests",                    type:"Number",   description:"Concurrent requests limit ", default:`${defaultOptions.maxSockets}` },
			{ option:"user-agent",                  type:"String",   description:"The user agent to use for checking links" }
		]
	});

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
		console.error(error.message);
		process.exit(1);
	}

	if (args.help)
	{
		console.log( optionator.generateHelp() );
	}
	else if (args.version)
	{
		console.log(pkg.version);
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
		process.exit(1);  // TODO :: exit gracefully with exitCode=1 ?
	}
}



function log()
{
	// Avoid spinner/progress chars getting stuck in the log
	gauge.hide();

	console.log.apply(null, arguments);

	gauge.show();
}



log.page = function(pageUrl)
{
	log( white("\nGetting links from: ") + yellow(pageUrl) );
};



log.page.metrics = function()
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



log.progress = function()
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



log.result = function(result/*, finalResult*/)
{
	if (result.displayed)
	{
		// TODO :: if the last result is skipped, the last RENDERED result will not be "└─"
		let output = gray( /*finalResult!==true ?*/ "├─" /*: "└─"*/ );

		const link = result.link;

		if (link.broken)
		{
			output += red("BROKEN");
			output += gray("─ ");
		}
		else if (link.excluded)
		{
			output += gray("─SKIP── ");
		}
		else
		{
			output += gray("──");
			output += green("OK");
			output += gray("─── ");
		}

		if (link.url.rebased != null)
		{
			output += yellow( link.url.rebased );
		}
		else
		{
			// TODO :: is this only for invalid links?
			output += yellow( link.url.original );
		}

		if (link.broken)
		{
			output += gray(` (${link.brokenReason})`);
		}
		else if (link.excluded)
		{
			output += gray(` (${link.excludedReason})`);
		}
		// Don't display cached message if broken/excluded message is displayed
		else if (link.http.cached)
		{
			output += gray(" (CACHED)");
		}

		log(output);
	}
};



/*
	Logs links in the order that they are found in their containing HTML
	document, even if later links receive an earlier response.
*/
log.results = function()
{
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
			return;
		}
	}
};



log.site = function(siteUrl)
{
	let output = "";

	if (++stats.site.totalPages > 1) output += "\n";

	output += white("\nStarting recursive scan...");

	log(output);
};



// TODO :: number of unique/uncached links
// TODO :: "excluded links" [from cli] doesn't make sense with a value of 0 when there're skipped links in the log
log.site.metrics = function()
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
	output += gray( humanizeDuration(Date.now() - stats.site.startTime, {round:true, largest:2}) );

	const separator = gray("=".repeat( longest(stripAnsi(output).split("\n")).length ));

	log(`\n${separator}${output}\n${separator}\n`);
};



function run()
{
	Object.keys(gaugeThemes).forEach(theme =>
	{
		//gaugeThemes[theme].preProgressbar = `\n\n${gaugeThemes[theme].preProgressbar}`;
		gaugeThemes[theme].preSubsection = gray("—");
	});

	gauge = new Gauge();
	stats = new Statistics();

	if (logOptions.recursive)
	{
		checker = new blc.SiteChecker(checkerOptions);
	}
	else
	{
		checker = new blc.HtmlUrlChecker(checkerOptions);
	}

	checker
	.on("html", function(tree, robots, response, pageUrl)
	{
		log.page(pageUrl);
	})
	.on("queue", function()
	{
		log.progress();
	})
	.on("junk", function(link)
	{
		stats.pushResult(link);
		log.progress();
		log.results();
	})
	.on("link", function(link)
	{
		stats.pushResult(link);
		log.progress();
		log.results();
	})
	.on("page", function(error, pageUrl)
	{
		if (error != null)
		{
			// "html" event will not have been called
			log.page(pageUrl);

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
	.on("site", function(error, siteUrl)
	{
		log.site.metrics();
		stats.resetSite();
	})
	.on("end", function()
	{
		// TODO :: store multiple site stats in an array and log all site metrics at very end?

		if (supportsSemigraphics())
		{
			// Exit gracefully
			clearInterval(spinner);
			gauge.disable();
			keyScanner.release();

			// TODO :: https://github.com/mikaelbr/node-notifier/issues/174
			notifier.notify({ title, message:"Finished!" });
		}
	})
	.on("error", function(error)
	{
		console.error(error);
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
		urls.forEach(url => checker.enqueue(url));
	}
	catch (error)
	{
		console.error(error.message);
		process.exit(1);
	}
}



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

		const hideCachedLink   = logOptions.hideCachedLinks   && link.broken===false && link.http.cached;
		const hideSkippedLink  = logOptions.hideSkippedLinks  && link.excluded;
		const hideUnbrokenLink = logOptions.hideUnbrokenLinks && link.broken===false;

		if (hideCachedLink || hideSkippedLink || hideUnbrokenLink)
		{
			this.page.hiddenLinks++;
			this.site.hiddenLinks++;
			result.displayed = false;
		}

		if (link.broken)
		{
			this.page.brokenLinks++;
			this.site.brokenLinks++;
			process.exitCode = 1;
		}
		else if (link.excluded)
		{
			this.page.skippedLinks++;
			this.site.skippedLinks++;
		}

		this.page.totalLinks++;
		this.site.totalLinks++;

		if (logOptions.maintainLinkOrder)
		{
			this.page.results[link.html.index] = result;
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



function togglePause(pause)
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
		clearInterval(spinner);
	}
	else
	{
		checker.resume();

		pauseMessage = gray("press space to pause");
		spinner = setInterval(() => gauge.pulse(pauseMessage), 50);
	}

	log.progress();
}



module.exports = cli;
