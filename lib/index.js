"use strict";
var check = require("./check");
var pkg = require("../package.json");
var validateInput = require("./validateInput");

var objectAssign = require("object-assign");
var rateLimit = require("rate-limit");
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
	rateLimit: 0,
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
	
	if (this.options.rateLimit > 0)
	{
		this.rateQueue = rateLimit.createQueue({ interval:this.options.rateLimit });
	}
	else
	{
		// Simulate rate-limit API
		this.rateQueue =
		{
			add: function(func){ func() }
		};
	}
}



BrokenLinkChecker.prototype.checkHtml = function(html, handlers)
{
	validateInput(
	{
		html:     { type:"string", value:html },
		handlers: { type:"object", value:handlers }
	});
	
	check.html(html, this.options, this.rateQueue, handlers);
};



BrokenLinkChecker.prototype.checkHtmlUrl = function(url, handlers)
{
	validateInput(
	{
		url:      { type:"string", value:url },
		handlers: { type:"object", value:handlers }
	});
	
	check.htmlUrl(url, this.options, this.rateQueue, handlers);
};



BrokenLinkChecker.prototype.checkUrl = function(url, callback)
{
	validateInput(
	{
		url:      { type:"string", value:url },
		callback: { type:"function", value:callback }
	});
	
	check.url(url, this.options, this.rateQueue, callback);
};



module.exports = BrokenLinkChecker;
