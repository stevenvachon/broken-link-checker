"use strict";
var blc            = require("./");
var defaultOptions = require("./internal/defaultOptions");
var pkg            = require("../package.json");

var chalk = require("chalk");
var nopter = require("nopter");



function cli()
{
	this.nopter = new nopter();
	
	this.nopter.config(
	{
		title: "Broken Link Checker",
		description: pkg.description,
		version: pkg.version,
		name: "blc",
		options:
		{
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
			"include-same":
			{
				rename: "includeLinksToSamePage",
				short: "s",
				info: "Will check links to the same page.",
				type: Boolean,
				default: !defaultOptions.excludeLinksToSamePage
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
			}
		},
		aliases: ["input"]
	});
}



cli.prototype.input = function(args, showArgs)
{
	//var testing = args === undefined;
	args = this.nopter.input(args);
	
	//if (testing===true && showArgs===true) return args;
	
	if (args.help === true)
	{
		console.log( this.nopter.help() );
	}
	else if (args.input != null)
	{
		run(args.input,
		{
			excludeExternalLinks: args.excludeExternalLinks,
			excludeInternalLinks: args.excludeInternalLinks,
			excludeLinksToSamePage: !args.includeLinksToSamePage
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
	var nextIsReady = true;
	var output;
	var result;
	
	do
	{
		result = results[meta.currentIndex];
		
		if (result !== undefined)
		{
			output  = chalk.yellow( result.url.resolved );
			output += chalk.gray(" -> ");  // "→" looks like shit with some fonts
			
			if (result.broken === false)
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
			
			if (meta.done!==true || meta.currentIndex!==results.length-1)
			{
				output = chalk.gray("├── ") + output;
				console.log(output);
			}
			else
			{
				output  = chalk.gray("└── ") + output + "\n";
				output += chalk.gray("Finished! "+results.length+" links found. ");
				output += chalk[ meta.brokenCount>0 ? "red" : "green" ](meta.brokenCount+" broken");
				output += chalk.gray(".");
				console.log(output);
				return;
			}
			
			meta.currentIndex++;
		}
		else
		{
			nextIsReady = false;
		}
	}
	while (nextIsReady);
}



function run(htmlUrl, options)
{
	var delay = null;
	var maintainLinkOrder = true;
	var meta = { brokenCount:0, currentIndex:0, done:false };
	var results = [];
	
	console.log("Getting page source: "+ chalk.yellow(htmlUrl));
	console.log("Getting links:");
	
	new blc.HtmlUrlChecker(options, 
	{
		link: function(result)
		{
			if (maintainLinkOrder === true)
			{
				results[result.html.index] = result;
			}
			else
			{
				results.push(result);
			}
			
			if (result.broken === true) meta.brokenCount++;
			
			// temp
			//if (result.broken === true) console.log(result.error || result.http.response);
			
			if (delay === null)
			{
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
