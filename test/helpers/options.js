"use strict";
const appDefaultOptions = require("../../lib/internal/defaultOptions");
const parseOptions      = require("../../lib/internal/parseOptions");

const testDefaultOptions =
{
	// All other options will use default values
	// as this will ensure that when they change, tests WILL break
	cacheResponses: false,
	excludeInternalLinks: false,
	filterLevel: 3,
	honorRobotExclusions: false,
	maxSockets: Infinity,
	maxSocketsPerHost: Infinity,
	retry405Head: false
};



const options = overrides => parseOptions(Object.assign
(
	{},
	appDefaultOptions,
	testDefaultOptions,
	overrides
));



module.exports = options;
