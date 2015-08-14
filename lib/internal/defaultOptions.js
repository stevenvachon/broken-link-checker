"use strict";
var pkg = require("../../package.json");

var userAgent = require("default-user-agent");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	cacheExpiryTime: 3600000,
	cacheResponses: false,
	excludedKeywords: [],
	excludedSchemes: ["data","geo","javascript","mailto","sms","tel"],
	excludeInternalLinks: false,
	excludeExternalLinks: false,
	excludeLinksToSamePage: true,
	excludeResponseData: true,
	filterLevel: 1,
	maxSockets: Infinity,
	maxSocketsPerHost: 1,
	rateLimit: 0,
	requestMethod: "head",
	tags: require("./tags"),
	userAgent: userAgent(pkg.name, pkg.version)
};



module.exports = defaultOptions;
