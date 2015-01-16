"use strict";
var objectAssign = require("object-assign");

var check = require("./check");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	site: undefined,
	timeout: 20000,
	tags:
	{
		a:    ["href"],
		area: ["href"],
		base: ["href"],
		link: ["href"],
		
		blockquote: ["cite"],
		del:        ["cite"],
		ins:        ["cite"],
		q:          ["cite"],
		
		form:   ["action"],
		head:   ["profile"],
		img:    ["longdesc", "src", "usemap"],
		input:  ["src", "usemap"],
		object: ["classid", "codebase", "data", "usemap"],	// TODO :: linkObj does not handle multiple urls
		script: ["for", "src"]
	}
};



function BrokenLinkChecker(options)
{
	this.options = objectAssign({}, defaultOptions, options);
}



BrokenLinkChecker.prototype.checkHtml = function(html, handlers)
{
	check.html(html, this.options, handlers);
};



// TODO :: rename?
BrokenLinkChecker.prototype.checkHtmlUrl = function(url, handlers)
{
	check.htmlUrl(url, this.options, handlers);
};



BrokenLinkChecker.prototype.checkUrl = function(url, callback)
{
	check.url(url, this.options, callback);
};



module.exports = BrokenLinkChecker;
