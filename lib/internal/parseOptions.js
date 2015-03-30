"use strict";
var pkg = require("../../package.json");

var objectAssign = require("object-assign");
var userAgent = require("default-user-agent");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	excludedSchemes: ["data","geo","mailto","sms","tel"],
	excludeInternalLinks: false,
	excludeLinksToSamePage: true,
	excludeResponseData: true,
	filterLevel: 1,
	maxSockets: Infinity,
	maxSocketsPerHost: 1,
	rateLimit: 0,
	tags: require("./tags"),
	userAgent: userAgent(pkg.name, pkg.version)
};



/*
	Convert an Array to a boolean-value Map.
	
	["asdf1","asdf2"]
	
	to
	
	{ asdf1:true, asdf2:true }
*/
function array2booleanMap(array)
{
	var i;
	var len = array.length;
	var map = {};
	
	for (i=0; i<len; i++)
	{
		map[ array[i] ] = true;
	}
	
	return map;
}



function parseOptions(options)
{
	options = objectAssign({}, defaultOptions, options);
	
	// Maps have better search performance, but are not friendly for options
	options.excludedSchemes = array2booleanMap(options.excludedSchemes);
	
	return options;
}



module.exports = parseOptions;
