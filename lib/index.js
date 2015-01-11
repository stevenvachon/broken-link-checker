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
	if (Array.isArray(htmls) !== true)
	{
		check.html(htmls, this.options, callback);
	}
	else
	{
		htmls.forEach( function(html)
		{
			// check.html(html, options, callback)
		});
	}
};



// TODO :: rename
BrokenLinkChecker.prototype.checkHtmlUrl = function(urls, callback)
{
	if (Array.isArray(urls) !== true)
	{
		check.htmlUrl(urls, this.options, callback);
	}
	else
	{
		urls.forEach( function(url)
		{
			// check.htmlUrl(url, options, callback)
		});
	}
};



BrokenLinkChecker.prototype.checkUrl = function(urls, callback)
{
	if (Array.isArray(urls) !== true)
	{
		check.url(urls, this.options, callback);
	}
	else
	{
		urls.forEach( function(url)
		{
			// check.url(url, options, callback)
		});
	}
};



module.exports = BrokenLinkChecker;
