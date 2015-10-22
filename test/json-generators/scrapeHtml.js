"use strict";
var fs = require("fs");
var path = require("path");

var utils = require("../utils");

var htmls = 
{
	"<a href>":          '<a href="fake.html">link</a>',
	"<area href/>":      '<area href="fake.html"/>',
	"<audio src>":       '<audio src="fake.ogg"></audio>',
	"<blockquote cite>": '<blockquote cite="fake.html">quote</blockquote>',
	"<del cite>":        '<del cite="fake.html">deleted</del>',
	"<embed src/>":      '<embed src="fake.swf"/>',
	"<form action>":     '<form action="fake.html">fields</form>',
	"<iframe longdesc>": '<iframe longdesc="fake.html"></iframe>',
	"<iframe src>":      '<iframe src="fake.html"></iframe>',
	"<img longdesc/>":   '<img longdesc="fake.html"/>',
	"<img src/>":        '<img src="fake.png"/>',
	"<input src/>":      '<input src="fake.png"/>',
	"<ins cite>":        '<ins cite="fake.html">inserted</ins>',
	"<link href/>":      '<link href="fake.css"/>',
	"<menuitem icon/>":  '<menuitem icon="fake.png"/>',
	
	"<meta http-equiv=\"refresh\" content/>": '<meta http-equiv="refresh" content="5; url=fake.html"/>',
	
	"<object data>":     '<object data="fake.swf"></object>',
	"<q cite>":          '<q cite="fake.html">quote</q>',
	"<script src>":      '<script src="fake.js"></script>',
	"<source src/>":     '<source src="fake.ogg"/>',
	"<track src/>":      '<track src="fake.vtt"/>',
	"<video src>":       '<video src="fake.ogg"></video>'
};



function generate()
{
	saveFile( path.normalize( __dirname + "/../json/scrapeHtml.json" ) );
}



function generateData()
{
	var base,htmlBase,url;
	
	var i;
	var output = {};
	
	for (i in htmls)
	{
		output[i] = 
		{
			skipOrOnly: "skip",
			html: htmls[i],
			length: 1,
			link:
			{
				url: { original:"" },
				html:
				{
					selector: "",
					tagName: "",
					attrName: "",
					tag: "",
					text: ""
				}
			}
		};
	}
	
	return output;
}



function generateString()
{
	// Extra line break for unix/git
	return JSON.stringify(generateData(), null, "\t") + "\n";
}



function saveFile(location)
{
	fs.writeFileSync(location, generateString());
	
	console.log("Written to: "+ location);
}



generate();
