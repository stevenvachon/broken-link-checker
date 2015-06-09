"use strict";
var blc = require("./");

var chalk = require("chalk");



function cli()
{
	var delay = null;
	var htmlUrl = process.argv[2];
	var maintainLinkOrder = true;
	var meta = { brokenCount:0, currentIndex:0, done:false };
	var results = [];
	
	if (htmlUrl !== undefined)
	{
		console.log("Getting page source: "+ chalk.yellow(htmlUrl));
		console.log("Getting links:");
		
		new blc.HtmlUrlChecker(null, 
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
}



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



module.exports = cli;
