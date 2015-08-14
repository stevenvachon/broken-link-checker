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
				type: Array,
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
			"include-same":
			{
				rename: "includeLinksToSamePage",
				short: "s",
				info: "Will check links to the same page.",
				type: Boolean,
				default: false
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
				info: "Display links that have already been logged.",
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
		run(args.input,
		{
			cacheResponses: true,
			excludedKeywords: args.excludedKeywords,
			excludeExternalLinks: args.excludeExternalLinks,
			excludeInternalLinks: args.excludeInternalLinks,
			excludeLinksToSamePage: args.includeLinksToSamePage!==true,
			filterLevel: args.filterLevel,
			requestMethod: args.get!==true ? "head" : "get"
		},
		{
			excludeCachedLinks: args.verbose!==true,
			maintainLinkOrder: args.maintainLinkOrder
		});
	}
	else
	{
		console.log( nopter.error.fatal("Input URL required", "Use --help for more options", "Error") );
	}
};



/*
	Logs links in the order that they are found in their containing HTML
	document, even if later links receive an earlier response.
*/
function logResults(results, meta)
{
	var done,output,result;
	var nextIsReady = true;
	
	do
	{
		result = results[meta.currentIndex];
		
		if (result !== undefined)
		{
			done = meta.done===true && meta.currentIndex>=results.length-1;
			output = "";
			
			if (result.excluded !== true)
			{
				output += chalk.yellow( result.url.resolved );
				output += chalk.gray(" -> ");  // "→" looks like shit with some fonts
				
				if (result.broken !== true)
				{
					output += chalk.green("OK");
				}
				else
				{
					output += chalk.red("BROKEN");
					output += chalk.gray(" -- ");
					
					if (result.error !== null)
					{
						output += chalk.gray(result.error.code || result.error.message);
					}
					else
					{
						output += chalk.gray(result.http.statusCode);
					}
				}
				
				if (done === false)
				{
					output = chalk.gray("├── ") + output;
				}
				else
				{
					output = chalk.gray("└── ") + output + "\n";
				}
			}
			
			if (done === true)
			{
				output += chalk.gray("Finished! "+(results.length - meta.excludedCount)+" links found. ");
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
	while (nextIsReady);
}



function run(htmlUrl, checkerOptions, logOptions)
{
	var delay = null;
	var meta = { brokenCount:0, currentIndex:0, done:false, excludedCount:0 };
	var results = [];
	
	console.log("Getting page source: "+ chalk.yellow(htmlUrl));
	console.log("Getting links:");
	
	spinner();
	
	new blc.HtmlUrlChecker(checkerOptions, 
	{
		link: function(result)
		{
			if (logOptions.maintainLinkOrder === true)
			{
				results[result.html.index] = result;
			}
			else
			{
				results.push(result);
			}
			
			if (logOptions.excludeCachedLinks===true && result.http.cached===true)
			{
				result.excluded = true;
				
				meta.excludedCount++;
			}
			else if (result.broken === true)
			{
				meta.brokenCount++;
			}
			
			// temp
			//if (result.broken === true) console.log(result.error || result.http.response);
			
			if (delay === null)
			{
				// Avoid calling `logResults()` via multiple synchronous iterations
				// and ensure that `logResults()` is called after `meta.done=true`
				delay = setImmediate( function()
				{
					logResults(results, meta);
					delay = null;
				});
			}
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
			meta.done = true;
			
			if (results.length === 0)
			{
				console.log( chalk.gray("Finished! 0 links found.") );
			}
		}
	}).enqueue(htmlUrl);
}



module.exports = cli;
