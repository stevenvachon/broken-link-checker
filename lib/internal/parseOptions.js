"use strict";
var defaultOptions = require("./defaultOptions");

var objectAssign = require("object-assign");



/*
	Convert an Array to a boolean-value Map.
	
	["asdf1","asdf2"]
	
	to
	
	{ asdf1:true, asdf2:true }
*/
function array2booleanMap(array)
{
	var i,map,numElements;
	
	if (Array.isArray(array) === true)
	{
		map = {};
		numElements = array.length;
		
		for (i=0; i<numElements; i++)
		{
			map[ array[i] ] = true;
		}
		
		return map;
	}
	
	// Unknown input -- return
	return array;
}



function parseOptions(options)
{
	if (options.__parsed !== true)
	{
		options = objectAssign({}, defaultOptions, options);
		
		// Maps have better search performance, but are not friendly for options
		options.acceptedSchemes = array2booleanMap(options.acceptedSchemes);
		options.excludedSchemes = array2booleanMap(options.excludedSchemes);
		
		// Undocumented -- avoids reparsing pass-thru options from class to class
		options.__parsed = true;
	}
	
	return options;
}



module.exports = parseOptions;
