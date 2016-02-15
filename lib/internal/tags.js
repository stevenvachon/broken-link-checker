"use strict";

var tags = 
{
	0:  // clickable links
	{
		a:      { href:true },
		area:   { href:true }
	},
	1:  // clickable links, media, iframes, meta refreshes
	{
		a:        { href:true },
		area:     { href:true },
		audio:    { src:true },
		embed:    { src:true },
		iframe:   { src:true },
		img:      { src:true },
		input:    { src:true },
		menuitem: { icon:true },
		meta:     { content:true },
		object:   { data:true },
		source:   { src:true },
		track:    { src:true },
		video:    { poster:true, src:true }
	},
	2:  // clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms
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
		meta:     { content:true },
		object:   { data:true },
		script:   { src:true },
		source:   { src:true },
		track:    { src:true },
		video:    { poster:true, src:true }
	},
	3:  // clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata
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
		meta:       { content:true },
		object:     { data:true },
		q:          { cite:true },
		script:     { src:true },
		source:     { src:true },
		track:      { src:true },
		video:      { poster:true, src:true }
	},
	
	length: 4  // simulate Array
};



// Only used for `SiteChecker`
tags.recursive = 
{
	0: tags[0],
	1:
	{
		a:        { href:true },
		area:     { href:true },
		iframe:   { src:true },
		meta:     { content:true },
	},
	2:
	{
		a:        { href:true },
		area:     { href:true },
		iframe:   { src:true },
		meta:     { content:true },
	},
	3:
	{
		a:          { href:true },
		area:       { href:true },
		blockquote: { cite:true },
		del:        { cite:true },
		iframe:     { longdesc:true, src:true },
		img:        { longdesc:true },
		ins:        { cite:true },
		meta:       { content:true },
		q:          { cite:true }
	}
};



module.exports = tags;
