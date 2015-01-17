"use strict";
var check = require("./check");

var objectAssign = require("object-assign");

var defaultOptions = 
{
	//404Source: null,
	//404Url: null,
	acceptedSchemes: ["http","https"],
	//maxConnections: 6,
	site: undefined,
	timeout: 20000,
	// TODO :: set up different filter levels: links, links+images, links+images+forms+etc
	tags:
	{
		a:    { href:true },
		area: { href:true },
		base: { href:true },
		link: { href:true },
		
		blockquote: { cite:true },
		del:        { cite:true },
		ins:        { cite:true },
		q:          { cite:true },
		
		form:   { action:true },
		img:    { longdesc:true, src:true },
		input:  { src:true },
		object: { data:true },
		script: { src:true }
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
