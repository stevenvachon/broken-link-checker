"use strict";
var objectAssign = require("object-assign");

var check = require("./check");

var defaultOptions = 
{
	acceptedSchemes: ["http","https"],
	site: undefined
};



function BrokenLinkChecker(options)
{
	this.options = objectAssign({}, defaultOptions, options);
}



BrokenLinkChecker.prototype.checkHtml = function(htmls, callback)
{
	check.html(htmls, this.options, callback);
};



// TODO :: rename
BrokenLinkChecker.prototype.checkHtmlUrl = function(urls, callback)
{
	check.htmlUrl(urls, this.options, callback);
};



BrokenLinkChecker.prototype.checkUrl = function(urls, callback)
{
	check.url(urls, this.options, callback);
};



module.exports = BrokenLinkChecker;
