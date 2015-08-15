"use strict";
var blc            = require("./");
var defaultOptions = require("./internal/defaultOptions");
var pkg            = require("../package.json");

var chalk = require("chalk");
var nopter = require("nopter");
var spinner = require("char-spinner");



function cli()
{
	var filterLevel = "The types of tags and attributes that are considered links.\n";
	filterLevel += "  0: clickable links\n";
	filterLevel += "  1: 0 + media\n";
	filterLevel += "  2: 1 + stylesheets, scripts, forms\n";
	filterLevel += "  3: 2 + meta\n";
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
				type: Boolean,
				default: defaultOptions.excludeExternalLinks
			},
			"exclude-internal":
			{
				rename: "excludeInternalLinks",
				short: "i",
				info: "Will not check internal links.",
				type: Boolean,
				default: defaultOptions.excludeInternalLinks
			},
			"filter-level":
			{
				info: filterLevel,
				type: Number,
				default: defaultOptions.filterLevel
			},
			"get":
			{
				short: "g",
				info: "Change request method to GET.",
				type: Boolean,
				default: false
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
			"ordered":
			{
				rename: "maintainLinkOrder",
				short: "o",
				info: "Maintain the order of links as they appear in their HTML document.",
				type: Boolean
			},
			"verbose":
			{
				short: "v",
				info: "Display excluded links.",
				type: Boolean,
				default: false
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
		console.log( this.nopter.help() );
	}
	else if (args.version === true)
	{
		console.log(pkg.version);
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
			cacheResponses: true,
			excludedKeywords: args.excludedKeywords,
			excludeExternalLinks: args.excludeExternalLinks,
			excludeInternalLinks: args.excludeInternalLinks,
			excludeLinksToSamePage: args.verbose!==true,
			filterLevel: args.filterLevel,
			requestMethod: args.get!==true ? "head" : "get"
		},
		{
			excludeCachedLinks: args.verbose!==true,
			excludeFilteredLinks: args.verbose!==true,
			maintainLinkOrder: args.maintainLinkOrder
		});
	}
	else
	{
		console.log( nopter.error.fatal("Input URL required", "Use --help for more options", "Error") );
	}
};



function logResult(result, finalResult)
{
	var output = "";
	
	if (result.__cli_excluded !== true)
	{
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
		
		output += chalk.yellow( result.url.resolved );
		
		if (result.broken === true)
		{
			if (result.error !== null)
			{
				output += chalk.gray(" ("+ (result.error.code || result.error.message) +")");
			}
			else
			{
				output += chalk.gray(" ("+ result.http.statusCode +")");
			}
		}
		// Don't display cached message if broken message is displayed
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
function logResults(results, meta)
{
	var done,output,result;
	var nextIsReady = true;
	
	while (nextIsReady)
	{
		result = results[meta.currentIndex];
		
		if (result !== undefined)
		{
			done = meta.done===true && meta.currentIndex>=results.length-1;
			
			output = logResult(result, done);
			
			if (done === true)
			{
				if (output !== "") output += "\n";
				
				output += chalk.gray("Finished! "+meta.totalCount+" links found. ");
				
				if (meta.excludedCount > 0)
				{
					output += chalk.gray(meta.excludedCount+" excluded. ");
				}
				
				output += chalk[ meta.brokenCount>0 ? "red" : "green" ](meta.brokenCount+" broken");
				output += chalk.gray(".");
			}
			
			if (output !== "") console.log(output);
			if (done === true) return;
			
			meta.currentIndex++;
		}
		else
		{
			nextIsReady = false;
		}
	}
}



/*
	Avoid calling `logResults()` via multiple synchronous iterations
	and ensure that `logResults()` is called after `meta.done=true`.
*/
function logResults_delayed(results, meta)
{
	if (meta.delay === null)
	{
		meta.delay = setImmediate( function()
		{
			logResults(results, meta);
			meta.delay = null;
		});
	}
}



function pushResult(results, result, options)
{
	if (options.maintainLinkOrder === true)
	{
		results[result.html.index] = result;
	}
	else
	{
		results.push(result);
	}
}



function run(htmlUrl, checkerOptions, logOptions)
{
	var meta = { brokenCount:0, currentIndex:0, delay:null, done:false, excludedCount:0, totalCount:0 };
	var results = [];
	
	console.log( chalk.white("Getting page source: ") + chalk.yellow(htmlUrl) );
	console.log( chalk.white("Getting links:") );
	
	spinner();
	
	new blc.HtmlUrlChecker(checkerOptions, 
	{
		link: function(result)
		{
			// Exclude cached links only if not broken
			if (result.broken===false && result.http.cached===true && logOptions.excludeCachedLinks===true)
			{
				result.__cli_excluded = true;
				
				meta.excludedCount++;
			}
			else if (result.broken === true)
			{
				meta.brokenCount++;
			}
			
			meta.totalCount++;
			
			pushResult(results, result, logOptions);
			
			logResults_delayed(results, meta);
		},
		junk: function(result)
		{
			if (logOptions.excludeFilteredLinks === true)
			{
				result.__cli_excluded = true;
				
				meta.excludedCount++;
			}
			
			meta.totalCount++;
			
			pushResult(results, result, logOptions);
			
			logResults_delayed(results, meta);
		},
		item: function(error)
		{
			if (error !== null)
			{
				console.log( chalk.red(error.name+": "+error.message) );
			}
		},
		end: function()
		{
			var output;
			meta.done = true;
			
			if (meta.totalCount - meta.excludedCount <= 0)
			{
				output = chalk.gray("Finished! "+meta.totalCount+" links found.");
				
				if (meta.excludedCount > 0)
				{
					output += chalk.gray(meta.excludedCount+" excluded.");
				}
				
				console.log(output);
			}
		}
	}).enqueue(htmlUrl);
}



module.exports = cli;
