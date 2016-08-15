"use strict";
const {name, version} = require("../../package.json");

const userAgent = require("default-user-agent");

const defaultOptions =
{
	acceptedSchemes: ["http:","https:"],  // TODO :: add "file:"
	cacheMaxAge: 3600000,
	cacheResponses: true,
	customFilter: result => true,
	excludedKeywords: [],
	excludedSchemes: ["data:","geo:","javascript:","mailto:","sms:","tel:"],
	excludeExternalLinks: false,
	excludeInternalLinks: false,
	excludeLinksToSamePage: false,
	filterLevel: 1,
	honorRobotExclusions: true,
	maxSockets: Infinity,
	maxSocketsPerHost: 1,  // TODO :: separate to `maxInternalSockets=5` and `maxExternalSockets=1`
	rateLimit: 0,
	requestMethod: "head",
	retry405Head: true,
	tags: require("./tags"),
	userAgent: userAgent(name, version)
};



module.exports = defaultOptions;
