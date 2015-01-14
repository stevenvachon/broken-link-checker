"use strict";
var objectAssign = require("object-assign");

var check = require("./check");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	site: undefined,
	timeout: 20000
};



function BrokenLinkChecker(options)
{
	this.options = objectAssign({}, defaultOptions, options);
}



BrokenLinkChecker.prototype.checkHtml = function(html, callback)
{
	check.html(html, this.options, callback);
};



// TODO :: rename?
BrokenLinkChecker.prototype.checkHtmlUrl = function(url, callback)
{
	check.htmlUrl(url, this.options, callback);
};



BrokenLinkChecker.prototype.checkUrl = function(url, callback)
{
	check.url(url, this.options, callback);
};



module.exports = BrokenLinkChecker;
