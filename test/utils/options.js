"use strict";
var appDefaultOptions = require("../../lib/internal/defaultOptions");
var parseOptions      = require("../../lib/internal/parseOptions");

var objectAssign = require("object-assign");

var testDefaultOptions =
{
	// All other options will use default values
	// as this will ensure that when they change, tests WILL break
	excludeInternalLinks: false,
	excludeLinksToSamePage: false,
	excludeResponseData: false,
	filterLevel: 3,
	maxSockets: Infinity,
	maxSocketsPerHost: Infinity,
	rateLimit: 0
};



function options(overrides)
{
	overrides = objectAssign
	(
		{},
		appDefaultOptions,
		testDefaultOptions,
		overrides
	);
	
	return parseOptions(overrides);
}



module.exports = options;
