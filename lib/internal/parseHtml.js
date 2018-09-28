"use strict";
const isStream = require("is-stream");
const isString = require("is-string");
const parse5 = require("parse5");

const options = { locationInfo:true, treeAdapter:parse5.treeAdapters.htmlparser2 };

/*
	Parse an HTML stream/string and return a tree.
*/
function parseHtml(input)
{
	return new Promise((resolve, reject) =>
	{
		if (isStream(input))
		{
			const parser = new parse5.ParserStream(options)
			.once("finish", () => resolve(parser.document));

			input.pipe(parser);
		}
		else if (isString(input))
		{
			resolve( parse5.parse(input, options) );
		}
		else
		{
			reject( new TypeError("Invalid input") );
		}
	});
}



module.exports = parseHtml;
