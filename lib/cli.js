"use strict";
var blc = require("./");

var chalk = require("chalk");



function cli()
{
	var delay = null;
	var meta = { brokenCount:0, currentIndex:0, done:false };
	var results = [];
	var url = process.argv[2];
	
	if (url !== undefined)
	{
		console.log("Getting page source: "+ chalk.yellow(url));
		console.log("Getting links:");
		
		new blc({site:url}).checkHtmlUrl(url, 
		{
			link: function(result)
			{
				results[result.html.index] = result;
				
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
	
	do
	{
		if (results[meta.currentIndex] !== undefined)
		{
			output  = chalk.yellow( results[meta.currentIndex].url.resolved );
			output += chalk.gray(" -> ");	// "→" looks like shit with some fonts
			output += results[meta.currentIndex].broken===false ? chalk.green("OK") : chalk.red("BROKEN");
			
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
