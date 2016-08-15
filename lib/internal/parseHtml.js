"use strict";
const isStream = require("is-stream");
const isString = require("is-string");
const parse5 = require("parse5");

const treeAdapter = Object.assign({}, parse5.treeAdapters.default);
treeAdapter.createElement_old = treeAdapter.createElement;
treeAdapter.createElement = function(tagName, namespaceURI, attrs)
{
	const result = treeAdapter.createElement_old(tagName, namespaceURI, attrs);
	result.attrMap = memoizeAttrs(result.attrs);
	return result;
};

const options = { locationInfo:true, treeAdapter:treeAdapter };



/*
	Convert attributes array to a map.

	Note: parse5 will have already handled multiple attrs of the
	same name.
*/
function memoizeAttrs(attrs)
{
	return attrs.reduce((map, attr) =>
	{
		map[attr.name] = attr.value;

		return map;

	}, {});
}



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
