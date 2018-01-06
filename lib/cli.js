"use strict";
var blc            = require("./");
var defaultOptions = require("./internal/defaultOptions");
var pkg            = require("../package.json");

var chalk = require("chalk");
var humanizeDuration = require("humanize-duration");
var nopter = require("nopter");
var spinner = require("char-spinner");

process.on("unhandledRejection", function(reason, p) {
	log( nopter.error.fatal("Unhandled Rejection", reason, "Error") );
	process.exit(1);
});

function cli()
{
	var filterLevel = "The types of tags and attributes that are considered links.\n";
	filterLevel += "  0: clickable links\n";
	filterLevel += "  1: 0 + media, iframes, meta refreshes\n";
	filterLevel += "  2: 1 + stylesheets, scripts, forms\n";
	filterLevel += "  3: 2 + metadata\n";
	filterLevel += "  Default: "+defaultOptions.filterLevel;
	
	this.nopter = new nopter();
	
	this.nopter.config(
	{
		title: "Broken Link Checker",
		description: pkg.description,
		version: pkg.version,
		name: "blc",
		options:
		{
			"exclude":
			{
				rename: "excludedKeywords",
				info: "A keyword/glob to match links against. Can be used multiple times.",
				type: [String, Array],
				default: defaultOptions.excludedKeywords
			},
			"exclude-external":
			{
				rename: "excludeExternalLinks",
				short: "e",
				info: "Will not check external links.",
				type: Boolean
			},
			"exclude-internal":
			{
				rename: "excludeInternalLinks",
				short: "i",
				info: "Will not check internal links.",
				type: Boolean
			},
			"filter-level":
			{
				info: filterLevel,
				type: Number,
				default: defaultOptions.filterLevel
			},
			"follow":
			{
				rename: "followRobotExclusions",
				short: "f",
				info: "Force-follow robot exclusions.",
				type: Boolean
			},
			"get":
			{
				short: "g",
				info: "Change request method to GET.",
				type: Boolean
			},
			"help":
			{
				short: ["h","?"],
				info: "Display this help text.",
				type: Boolean
			},
			"input":
			{
				info: "URL to an HTML document.",
				type: require("url")
			},
			"host-requests":
			{
				rename: "maxSocketsPerHost",
				info: "Concurrent requests limit per host.",
				type: Number,
				default: defaultOptions.maxSocketsPerHost
			},
			"ordered":
			{
				rename: "maintainLinkOrder",
				short: "o",
				info: "Maintain the order of links as they appear in their HTML document.",
				type: Boolean
			},
			"recursive":
			{
				short: "r",
				info: "Recursively scan (\"crawl\") the HTML document(s).",
				type: Boolean
			},
			"requests":
			{
				rename: "maxSockets",
				info: "Concurrent requests limit.",
				type: Number,
				default: defaultOptions.maxSockets
			},
			"user-agent":
			{
				info: "The user agent to use for link checks.",
				type: String,
				default: defaultOptions.userAgent
			},
			"verbose":
			{
				short: "v",
				info: "Display excluded links.",
				type: Boolean
			},
			"version":
			{
				short: "V",
				info: "Display the app version.",
				type: Boolean
			}
		},
		aliases: ["input"]
	});
}



cli.prototype.input = function(args, showArgs)
{
	//var testing = args !== undefined;
	args = this.nopter.input(args);
	
	//if (testing===true && showArgs===true) return args;
	
	if (args.help === true)
	{
		log( this.nopter.help() );
	}
	else if (args.version === true)
	{
		log(pkg.version);
	}
	else if (args.input != null)
	{
		// TODO :: remove this when nopter's default values for Arrays are fixed
		if (args.excludedKeywords === undefined)
		{
			args.excludedKeywords = defaultOptions.excludedKeywords;
		}
		
		run(args.input,
		{
			excludedKeywords:       args.excludedKeywords,
			excludeExternalLinks:   args.excludeExternalLinks===true,
			excludeInternalLinks:   args.excludeInternalLinks===true,
			excludeLinksToSamePage: args.verbose!==true,
			filterLevel:            args.filterLevel,
			honorRobotExclusions:   args.followRobotExclusions!==true,
			maxSockets:             args.maxSockets,
			maxSocketsPerHost:      args.maxSocketsPerHost,
			requestMethod:          args.get!==true ? "head" : "get",
			userAgent:              args.userAgent
		},
		{
			excludeCachedLinks:   args.verbose!==true,
			excludeFilteredLinks: args.verbose!==true,
			maintainLinkOrder:    args.maintainLinkOrder,
			recursive:            args.recursive
		});
	}
	else
	{
		log( nopter.error.fatal("Input URL required", "Use --help for more options", "Error") );
		process.exit(1);
	}
};



function log()
{
	// Avoid spinner chars getting stuck in the log
	spinner.clear();
	
	console.log.apply(null, arguments);
}



function logMetrics(brokenLinks, excludedLinks, totalLinks, duration, preBreak, exit)
{
	var output = preBreak===true ? "\n" : "";
	
	output += chalk.gray("Finished! "+totalLinks+" links found.");
	
	if (excludedLinks > 0)
	{
		output += chalk.gray(" "+excludedLinks+" excluded.");
	}
	
	if (totalLinks > 0)
	{
		output += chalk.gray(" ");
		output += chalk[ brokenLinks>0 ? "red" : "green" ](brokenLinks+" broken");
		output += chalk.gray(".");
	}
	
	if (duration != null)
	{
		output += chalk.gray("\nElapsed time: ");
		output += chalk.gray( humanizeDuration(duration, {round:true, largest:2}) );
	}
	
	log(output);

	if (exit === true)
	{
		process.exit(brokenLinks===0 ? 0 : 1);
	}
}



/*
	Ensure that `logMetrics()` is called after `logResults_delayed()`.
*/
function logMetrics_delayed(brokenLinks, excludedLinks, totalLinks, duration, preBreak, exit)
{
	setImmediate( function()
	{
		logMetrics(brokenLinks, excludedLinks, totalLinks, duration, preBreak, exit);
	});
}



function logPage(data, pageUrl)
{
	var output = "";
	
	if (++data.total.pages > 1) output += "\n";
	
	output += chalk.white("Getting links from: ") + chalk.yellow(pageUrl);
	
	log(output);
}



function logResult(result, finalResult)
{
	var output = "";
	
	if (result.__cli_excluded !== true)
	{
		// TODO :: if later results are skipped, the last RENDERED result will not be "└─"
		output = chalk.gray( finalResult!==true ? "├─" : "└─" );
		
		if (result.broken === true)
		{
			output += chalk.red("BROKEN");
			output += chalk.gray("─ ");
		}
		else if (result.excluded === true)
		{
			output += chalk.gray("─SKIP── ");
		}
		else
		{
			output += chalk.gray("──");
			output += chalk.green("OK");
			output += chalk.gray("─── ");
		}
		
		if (result.url.resolved != null)
		{
			output += chalk.yellow( result.url.resolved );
		}
		else
		{
			// Excluded scheme
			output += chalk.yellow( result.url.original );
		}
		
		if (result.broken === true)
		{
			output += chalk.gray(" ("+ result.brokenReason +")");
		}
		else if (result.excluded === true)
		{
			output += chalk.gray(" ("+ result.excludedReason +")");
		}
		// Don't display cached message if broken/excluded message is displayed
		else if (result.http.cached === true)
		{
			output += chalk.gray(" (CACHED)");
		}
	}
	
	return output;
}



/*
	Logs links in the order that they are found in their containing HTML
	document, even if later links receive an earlier response.
*/
function logResults(data)
{
	var done,output,result;
	var nextIsReady = true;
	
	while (nextIsReady)
	{
		result = data.page.results[data.page.currentIndex];
		
		if (result !== undefined)
		{
			done = data.page.done===true && data.page.currentIndex>=data.page.results.length-1;
			
			output = logResult(result, done);
			
			if (output !== "") log(output);
			if (done === true) return;
			
			data.page.currentIndex++;
		}
		else
		{
			nextIsReady = false;
		}
	}
}



/*
	Ensure that `logResults()` is called after `data.page.done=true`.
*/
function logResults_delayed(data)
{
	// Avoid more than one delay via multiple synchronous iterations
	if (data.delay === null)
	{
		data.delay = setImmediate( function()
		{
			logResults(data);
			data.delay = null;
		});
	}
}



function pushResult(data, result, options)
{
	if (options.maintainLinkOrder === true)
	{
		data.page.results[result.html.index] = result;
	}
	else
	{
		data.page.results.push(result);
	}
}



function resetPageData(data)
{
	data.page.brokenLinks = 0;
	data.page.currentIndex = 0;
	data.page.done = false;
	data.page.excludedLinks = 0;
	data.page.results = [];
	//data.page.startTime = Date.now();
	data.page.totalLinks = 0;
}



function run(url, checkerOptions, logOptions)
{
	var handlers,instance;
	var data = 
	{
		delay: null,
		page: {},
		total:
		{
			brokenLinks: 0,
			excludedLinks: 0,
			links: 0,
			pages: 0,
			startTime: Date.now()
		}
	};
	
	// In case first page doesn't call "html" handler
	resetPageData(data);
	
	handlers =  
	{
		html: function(tree, robots, response, pageUrl)
		{
			resetPageData(data);
			
			logPage(data, pageUrl);
		},
		junk: function(result)
		{
			if (logOptions.excludeFilteredLinks === true)
			{
				result.__cli_excluded = true;
				
				data.page.excludedLinks++;
				data.total.excludedLinks++;
			}
			
			data.page.totalLinks++;
			data.total.links++;
			
			pushResult(data, result, logOptions);
			
			logResults_delayed(data);
		},
		link: function(result)
		{
			// Exclude cached links only if not broken
			if (result.broken===false && result.http.cached===true && logOptions.excludeCachedLinks===true)
			{
				result.__cli_excluded = true;
				
				data.page.excludedLinks++;
				data.total.excludedLinks++;
			}
			else if (result.broken === true)
			{
				data.page.brokenLinks++;
				data.total.brokenLinks++;
			}
			
			data.page.totalLinks++;
			data.total.links++;
			
			pushResult(data, result, logOptions);
			
			logResults_delayed(data);
		},
		page: function(error, pageUrl)
		{
			if (error != null)
			{
				// "html" handler will not have been called
				logPage(data, pageUrl);
				
				log( chalk[ error.code!==200 ? "red" : "gray" ](error.name+": "+error.message) );
			}
			else
			{
				data.page.done = true;
				
				logMetrics_delayed(data.page.brokenLinks, data.page.excludedLinks, data.page.totalLinks);
			}
		},
		end: function()
		{
			if (data.total.pages <= 0)
			{
				process.exit(1);
			}
			else if (data.total.pages === 1)
			{
				process.exit(data.page.done===true && data.total.brokenLinks===0 ? 0 : 1);
			}
			else if (data.total.pages > 1)
			{
				logMetrics_delayed(data.total.brokenLinks, data.total.excludedLinks, data.total.links, Date.now()-data.total.startTime, true, true);
			}
		}
	};
	
	if (logOptions.recursive !== true)
	{
		instance = new blc.HtmlUrlChecker(checkerOptions, handlers);
	}
	else
	{
		instance = new blc.SiteChecker(checkerOptions, handlers);
	}
	
	spinner();
	
	instance.enqueue(url);
}



module.exports = cli;
