"use strict";

module.exports = 
[
	// 0 :: clickable links
	{
		a:      { href:true },
		area:   { href:true }
	},
	// 1 :: clickable links, media
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
	// 2 :: clickable links, media, stylesheets, scripts, forms
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
	// 3 :: clickable links, media, stylesheets, scripts, forms, meta
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
];
