"use strict";

const tags =
{
	0:  // clickable links
	{
		a:      { href:true },
		area:   { href:true }
	},
	1:  // clickable links, media, frames, meta refreshes
	{
		a:        { href:true },
		applet:   { archive:true, code:true, src:true },
		area:     { href:true },
		audio:    { src:true },
		body:     { background:true },
		embed:    { src:true },
		frame:    { src:true },
		iframe:   { src:true },
		img:      { src:true, srcset:true },
		input:    { src:true },
		menuitem: { icon:true },
		meta:     { content:true },
		object:   { data:true },
		source:   { src:true, srcset:true },
		table:    { background:true },
		tbody:    { background:true },
		td:       { background:true },
		tfoot:    { background:true },
		th:       { background:true },
		thead:    { background:true },
		tr:       { background:true },
		track:    { src:true },
		video:    { poster:true, src:true }
	},
	2:  // clickable links, media, frames, meta refreshes, stylesheets, scripts, forms
	{
		a:        { href:true },
		applet:   { archive:true, code:true, src:true },
		area:     { href:true },
		audio:    { src:true },
		body:     { background:true },
		button:   { formaction:true },
		embed:    { src:true },
		form:     { action:true },
		frame:    { src:true },
		iframe:   { src:true },
		img:      { src:true, srcset:true },
		input:    { formaction:true, src:true },
		link:     { href:true },
		menuitem: { icon:true },
		meta:     { content:true },
		object:   { data:true },
		script:   { src:true },
		source:   { src:true, srcset:true },
		table:    { background:true },
		tbody:    { background:true },
		td:       { background:true },
		tfoot:    { background:true },
		th:       { background:true },
		thead:    { background:true },
		tr:       { background:true },
		track:    { src:true },
		video:    { poster:true, src:true }
	},
	3:  // clickable links, media, frames, meta refreshes, stylesheets, scripts, forms, metadata
	{
		a:          { href:true, ping:true },
		applet:     { archive:true, code:true, codebase:true, object:true, src:true },
		area:       { href:true, ping:true },
		audio:      { src:true },
		blockquote: { cite:true },
		body:       { background:true },
		button:     { formaction:true },
		del:        { cite:true },
		embed:      { src:true },
		form:       { action:true },
		frame:      { longdesc:true, src:true },
		head:       { profile:true },
		html:       { manifest:true },
		iframe:     { longdesc:true, src:true },
		img:        { longdesc:true, src:true, srcset:true },
		input:      { formaction:true, src:true },
		ins:        { cite:true },
		link:       { href:true },
		menuitem:   { icon:true },
		meta:       { content:true },
		object:     { codebase:true, data:true },
		q:          { cite:true },
		script:     { src:true },
		source:     { src:true, srcset:true },
		table:      { background:true },
		tbody:      { background:true },
		td:         { background:true },
		tfoot:      { background:true },
		th:         { background:true },
		thead:      { background:true },
		tr:         { background:true },
		track:      { src:true },
		video:      { poster:true, src:true },
		"*":        { itemtype:true }
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
		frame:      { longdesc:true },
		iframe:     { longdesc:true, src:true },
		img:        { longdesc:true },
		ins:        { cite:true },
		meta:       { content:true },
		q:          { cite:true }
	}
};



module.exports = tags;
