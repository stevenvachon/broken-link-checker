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
	base: undefined,
	excludeEmptyAnchors: false,
	filterLevel: 1,
	maxSockets: 2,
	//maxSocketsPerHost: 2,	// avoid ddos'ing
	tags:
	{
		0:	// clickable links
		{
			a:      { href:true },
			area:   { href:true }
		},
		1:	// clickable links, media
		{
			a:        { href:true },
			area:     { href:true },
			audio:    { src:true },
			embed:    { src:true },
			iframe:   { src:true },
			img:      { src:true },
			input:    { src:true },
			menuitem: { icon:true },
			object:   { data:true },
			source:   { src:true },
			track:    { src:true },
			video:    { poster:true, src:true }
		},
		2:	// clickable links, media, stylesheets, scripts, forms
		{
			a:        { href:true },
			area:     { href:true },
			audio:    { src:true },
			embed:    { src:true },
			form:     { action:true },
			iframe:   { src:true },
			img:      { src:true },
			input:    { src:true },
			link:     { href:true },
			menuitem: { icon:true },
			object:   { data:true },
			script:   { src:true },
			source:   { src:true },
			track:    { src:true },
			video:    { poster:true, src:true }
		},
		3:	// clickable links, media, stylesheets, scripts, forms, meta
		{
			a:          { href:true },
			area:       { href:true },
			audio:      { src:true },
			blockquote: { cite:true },
			del:        { cite:true },
			embed:      { src:true },
			form:       { action:true },
			iframe:     { longdesc:true, src:true },
			img:        { longdesc:true, src:true },
			input:      { src:true },
			ins:        { cite:true },
			link:       { href:true },
			menuitem:   { icon:true },
			object:     { data:true },
			q:          { cite:true },
			script:     { src:true },
			source:     { src:true },
			track:      { src:true },
			video:      { poster:true, src:true }
		}
	},
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
