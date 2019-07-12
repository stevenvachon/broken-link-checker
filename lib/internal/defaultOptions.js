"use strict";
var pkg = require("../../package.json");

var userAgent = require("default-user-agent");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	cacheExpiryTime: 3600000,
	cacheResponses: true,
	excludedKeywords: [],
	excludedSchemes: ["data","geo","javascript","mailto","sms","tel"],
	excludeExternalLinks: false,
	excludeInternalLinks: false,
	excludeLinksToSamePage: true,
	filterLevel: 1,
	honorRobotExclusions: true,
	maxSockets: Infinity,
	maxSocketsPerHost: 1,
	rateLimit: 0,
	requestMethod: "head",
	retry405Head: true,
	tags: require("./tags"),
	userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
	//userAgent: userAgent(pkg.name, pkg.version)
};



module.exports = defaultOptions;
