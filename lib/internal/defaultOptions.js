"use strict";
var pkg = require("../../package.json");

var userAgent = require("default-user-agent");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	excludedSchemes: ["data","geo","mailto","sms","tel","javascript"],
	excludeInternalLinks: false,
	excludeExternalLinks: false,
	excludeLinksToSamePage: true,
	excludeResponseData: true,
	filterLevel: 1,
	maxSockets: Infinity,
	maxSocketsPerHost: 1,
	rateLimit: 0,
	tags: require("./tags"),
	userAgent: userAgent(pkg.name, pkg.version)
};



module.exports = defaultOptions;
