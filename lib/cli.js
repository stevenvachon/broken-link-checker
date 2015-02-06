"use strict";
var blc = require("./");

var chalk = require("chalk");



function cli()
{
	var delay = null;
	var meta = { brokenCount:0, currentIndex:0, done:false };
	var results = [];
	var url = process.argv[2];
	var maintainLinkOrder = true;
	
	if (url !== undefined)
	{
		console.log("Getting page source: "+ chalk.yellow(url));
		console.log("Getting links:");
		
		new blc().checkHtmlUrl(url, 
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
				//if (result.broken === true) console.log(result.error || result.response);
				
				if (delay === null)
				{
					delay = setImmediate( function()
					{
						logResults(results, meta);
						delay = null;
					});
				}
			},
			complete: function(error)
			{
				if (error !== null)
				{
					console.log( chalk.red(error.message) );
				}
				else
				{
					meta.done = true;
					
					if (results.length === 0)
					{
						console.log( chalk.gray("Finished! 0 links found.") );
					}
				}
			}
		});
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
			output += chalk.gray(" -> ");	// "→" looks like shit with some fonts
			
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
					output += chalk.gray(result.response.statusCode);
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
