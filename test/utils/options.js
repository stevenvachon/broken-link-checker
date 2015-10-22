"use strict";
var appDefaultOptions = require("../../lib/internal/defaultOptions");
var parseOptions      = require("../../lib/internal/parseOptions");

var testDefaultOptions =
{
	// All other options will use default values
	// as this will ensure that when they change, tests WILL break
	cacheResponses: false,
	excludeInternalLinks: false,
	excludeLinksToSamePage: false,
	filterLevel: 3,
	honorRobotExclusions: false,
	maxSockets: Infinity,
	maxSocketsPerHost: Infinity
};



function options(overrides)
{
	overrides = Object.assign
	(
		{},
		appDefaultOptions,
		testDefaultOptions,
		overrides
	);

	return parseOptions(overrides);
}



module.exports = options;
