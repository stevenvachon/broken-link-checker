"use strict";
const {normalize:normalizePath} = require("path");
const {writeFileSync} = require("fs");

const htmls =
{
	'<a href>':            `<a href="file.html">link</a>`,
	'<a ping>':            `<a ping="file.html">link</a>`,
	'<applet archive>':    `<applet archive="file.zip">params</applet>`,
	'<applet code>':       `<applet code="file.class">params</applet>`,
	'<applet codebase>':   `<applet codebase="file.html">params</applet>`,
	'<applet object>':     `<applet object="file.html">params</applet>`,
	'<applet src>':        `<applet src="file.html">params</applet>`,
	'<area href/>':        `<area href="file.html"/>`,
	'<area ping/>':        `<area ping="file.html"/>`,
	'<audio src>':         `<audio src="file.ogg">sources/tracks</audio>`,
	'<blockquote cite>':   `<blockquote cite="file.html">quote</blockquote>`,
	'<body background>':   `<body background="file.png">html</body>`,
	'<button formaction>': `<button formaction="file.html">button</button>`,
	'<del cite>':          `<del cite="file.html">deleted</del>`,
	'<embed src/>':        `<embed src="file.swf"/>`,
	'<form action>':       `<form action="file.html">fields</form>`,
	'<frame longdesc/>':   `<frameset><frame longdesc="file.html"/></frameset>`,
	'<frame src/>':        `<frameset><frame src="file.html"/></frameset>`,
	'<head profile>':      `<head profile="file.html">meta</head>`,
	'<html manifest>':     `<html manifest="file.appcache">html</html>`,
	'<iframe longdesc>':   `<iframe longdesc="file.html"></iframe>`,
	'<iframe src>':        `<iframe src="file.html"></iframe>`,
	'<img longdesc/>':     `<img longdesc="file.html"/>`,
	'<img src/>':          `<img src="file.png"/>`,
	'<img srcset/>':       `<img srcset="file.png 2x"/>`,
	'<input formaction/>': `<input formaction="file.html"/>`,
	'<input src/>':        `<input src="file.png"/>`,
	'<ins cite>':          `<ins cite="file.html">inserted</ins>`,
	'<link href/>':        `<link href="file.css"/>`,
	'<menuitem icon/>':    `<menuitem icon="file.png"/>`,

	'<meta http-equiv="refresh" content/>': `<meta http-equiv="refresh" content="5; url=file.html"/>`,

	'<object codebase>':   `<object codebase="file.html">params</object>`,
	'<object data>':       `<object data="file.swf">params</object>`,
	'<q cite>':            `<q cite="file.html">quote</q>`,
	'<script src>':        `<script src="file.js"></script>`,
	'<source src/>':       `<source src="file.ogg"/>`,
	'<source srcset/>':    `<source srcset="file.png 2x"/>`,
	'<table background>':  `<table background="file.png">spreadsheet</table>`,
	'<tbody background>':  `<table><tbody background="file.png">rows</tbody></table>`,
	'<td background>':     `<table><td background="file.png">data</td></table>`,
	'<tfoot background>':  `<table><tfoot background="file.png">rows</tfoot></table>`,
	'<th background>':     `<table><th background="file.png">heading</th></table>`,
	'<thead background>':  `<table><thead background="file.png">rows</thead></table>`,
	'<tr background>':     `<table><tr background="file.png">columns</tr></table>`,
	'<track src/>':        `<track src="file.vtt"/>`,
	'<video poster>':      `<video poster="file.png">sources/tracks</video>`,
	'<video src>':         `<video src="file.ogg">sources/tracks</video>`
};



const generate = () => saveFile( normalizePath(`${__dirname}/../json/scrapeHtml.json`) );



const generateData = () =>
{
	const output = {};

	for (let i in htmls)
	{
		output[i] =
		{
			skipOrOnly: "skip",
			html: htmls[i],
			length: 1,
			link:
			{
				// Placeholder values for manual editing
				url:
				{
					original: "",
					resolved: { href:"http://domain.com/" },
					rebased:  { href:"http://domain.com/" },
					redirected: null
				},
				base:
				{
					resolved: { href:"http://domain.com/" },
					rebased:  { href:"http://domain.com/" }
				},
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
};


// Extra line break for unix/git
const generateString = () => JSON.stringify(generateData(), null, "\t") + "\n";



const saveFile = location =>
{
	writeFileSync(location, generateString());

	console.log(`Written to: ${location}`);
};



generate();
