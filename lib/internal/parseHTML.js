"use strict";
var isStream = require("is-stream");
var isString = require("is-string");
var parse5 = require("parse5");

var treeAdapter = Object.create( parse5.treeAdapters.default );
treeAdapter.createElement_old = treeAdapter.createElement;
treeAdapter.createElement = function(tagName, namespaceURI, attrs)
{
	var result = treeAdapter.createElement_old(tagName, namespaceURI, attrs);
	
	if (result.attrs != null)
	{
		result.attrMap = getAttrMap(result.attrs);
	}
	
    return result;
};

var options = { locationInfo:true, treeAdapter:treeAdapter };



/*
	Convert attributes array to a map.
	
	Note: parse5 will have already handled multiple attrs of the
	same name.
*/
function getAttrMap(attrs)
{
	var i;
	var map = {};
	var numAttrs = attrs.length;
	
	for (i=0; i<numAttrs; i++)
	{
		map[ attrs[i].name ] = attrs[i].value;
	}
	
	return map;
}



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
