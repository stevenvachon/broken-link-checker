"use strict";
var check = require("./check");
var pkg = require("../package.json");
var validateInput = require("./validateInput");

var objectAssign = require("object-assign");
var userAgent = require("default-user-agent");

var defaultOptions = 
{
	//404Source: null,
	//404Url: null,
	acceptedSchemes: ["http","https"],
	excludeEmptyAnchors: false,
	filterLevel: 1,
	//maxConnections: 6,
	site: undefined,
	tags:
	{
		0:	// clickable links
		{
			a:      { href:true },
			area:   { href:true }
		},
		1:	// clickable links, images
		{
			a:      { href:true },
			area:   { href:true },
			img:    { src:true },
			input:  { src:true }
		},
		2:	// clickable links, images, stylesheets, scripts, forms
		{
			a:      { href:true },
			area:   { href:true },
			form:   { action:true },
			img:    { src:true },
			input:  { src:true },
			link:   { href:true },
			script: { src:true }
		},
		3:	// clickable links, images, stylesheets, scripts, forms, meta
		{
			a:          { href:true },
			area:       { href:true },
			blockquote: { cite:true },
			del:        { cite:true },
			form:       { action:true },
			img:        { longdesc:true, src:true },
			input:      { src:true },
			ins:        { cite:true },
			link:       { href:true },
			object:     { data:true },
			q:          { cite:true },
			script:     { src:true }
		}
	},
	timeout: 20000,	// linux default
	userAgent: userAgent(pkg.name, pkg.version)
};



function BrokenLinkChecker(options)
{
	this.options = objectAssign({}, defaultOptions, options);
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
