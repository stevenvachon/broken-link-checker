"use strict";
/*var check = require("./check");
var pkg = require("../package.json");
var validateInput = require("./validateInput");

var objectAssign = require("object-assign");
var RequestQueue = require("limited-request-queue");
var userAgent = require("default-user-agent");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	excludedSchemes: ["data","geo","mailto","sms","tel"],
	base: undefined,
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



function BrokenLinkChecker(options)
{
	
}



BrokenLinkChecker.prototype.checkHtml = function(html, handlers)
{
	validateInput(
	{
		html:     { type:"string", value:html },
		handlers: { type:"object", value:handlers }
	});
	
	check.html(html, this.options, this.queue, handlers);
};



BrokenLinkChecker.prototype.checkHtmlUrl = function(url, handlers)
{
	validateInput(
	{
		url:      { type:"string", value:url },
		handlers: { type:"object", value:handlers }
	});
	
	check.htmlUrl(url, this.options, this.queue, handlers);
};



BrokenLinkChecker.prototype.checkUrl = function(url, callback)
{
	validateInput(
	{
		url:      { type:"string", value:url },
		callback: { type:"function", value:callback }
	});
	
	check.url(url, this.options, this.queue, callback);
};*/



var blc = 
{
	HtmlChecker:    require("./classes/HtmlChecker"),
	HtmlUrlChecker: require("./classes/HtmlUrlChecker"),
	UrlChecker:     require("./classes/UrlChecker")
};



module.exports = blc;
