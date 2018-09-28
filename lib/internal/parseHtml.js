"use strict";
var isStream = require("is-stream");
var isString = require("is-string");
var parse5 = require("parse5");

var options = { locationInfo:true, treeAdapter:parse5.treeAdapters.htmlparser2 };


/*
	Parse an HTML stream/string and return a tree.
*/
function parseHtml(input)
{
	return new Promise( function(resolve, reject)
	{
		if (isStream(input) === true)
		{
			var parser = new parse5.ParserStream(options);
			
			parser.on("finish", function()
			{
				resolve(parser.document);
			});
			
			input.pipe(parser);
		}
		else if (isString(input) === true)
		{
			resolve( parse5.parse(input, options) );
		}
		else
		{
			reject("Invalid input");
		}
	});
}



module.exports = parseHtml;
