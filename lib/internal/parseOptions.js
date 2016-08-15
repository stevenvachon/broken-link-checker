"use strict";
const defaultOptions = require("./defaultOptions");



/*
	Convert an Array to a boolean-value Map.

	["asdf1","asdf2"]

	to

	{ asdf1:true, asdf2:true }
*/
function memoize(array)
{
	return array.reduce((map, value) =>
	{
		map[ value.toLowerCase() ] = true;

		return map;

	}, {});
}



function parseOptions(options)
{
	if (options==null || options.__parsed!==true)
	{
		options = Object.assign({}, defaultOptions, options);

		// Maps have better search performance, but are not friendly for options
		options.acceptedSchemes = memoize(options.acceptedSchemes);
		options.excludedSchemes = memoize(options.excludedSchemes);

		options.requestMethod = options.requestMethod.toLowerCase();

		// Undocumented -- avoids reparsing pass-thru options from class to class
		options.__parsed = true;
	}

	return options;
}



module.exports = parseOptions;
