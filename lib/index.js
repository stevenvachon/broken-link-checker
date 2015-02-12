"use strict";
var check = require("./check");
var pkg = require("../package.json");
var validateInput = require("./validateInput");

var objectAssign = require("object-assign");
var userAgent = require("default-user-agent");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	excludedSchemes: ["data","geo","mailto","sms","tel"],
	base: undefined,
	excludeInternalLinks: false,
	excludeLinksToSamePage: true,
	filterLevel: 1,
	maxSockets: 1,
	tags: require("./tags"),
	userAgent: userAgent(pkg.name, pkg.version)
};



function BrokenLinkChecker(options)
{
	this.options = objectAssign({}, defaultOptions, options);
	
	var excludedSchemesMap = {};
	
	for (var i=0; i<this.options.excludedSchemes.length; i++)
	{
		excludedSchemesMap[ this.options.excludedSchemes[i] ] = true;
	}
	
	// Maps have better search performance, but are not friendly for options
	this.options.excludedSchemes = excludedSchemesMap;
}



BrokenLinkChecker.prototype.checkHtml = function(html, handlers)
{
	validateInput(
	{
		html:     { type:"string", value:html },
		handlers: { type:"object", value:handlers }
	});
	
	check.html(html, this.options, handlers);
};



BrokenLinkChecker.prototype.checkHtmlUrl = function(url, handlers)
{
	validateInput(
	{
		url:      { type:"string", value:url },
		handlers: { type:"object", value:handlers }
	});
	
	check.htmlUrl(url, this.options, handlers);
};



BrokenLinkChecker.prototype.checkUrl = function(url, callback)
{
	validateInput(
	{
		url:      { type:"string", value:url },
		callback: { type:"function", value:callback }
	});
	
	check.url(url, this.options, callback);
};



module.exports = BrokenLinkChecker;
