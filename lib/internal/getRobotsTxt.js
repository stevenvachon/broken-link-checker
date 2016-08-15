"use strict";
const bhttp = require("bhttp");
const guard = require("robots-txt-guard");
const parse = require("robots-txt-parse");
const {URL} = require("universal-url");



// TODO :: needs test
// TODO :: use `requestUrl`
function getRobotsTxt(url, options)
{
	url = new URL(url);
	url.hash = "";
	url.pathname = "/robots.txt";
	url.search = "";

	return bhttp.get(url.href,  // TODO :: https://github.com/joepie91/node-bhttp/issues/3
	{
		headers: { "user-agent":options.userAgent },
		stream: true
	})
	.then(parse)
	.then(guard);
}



module.exports = getRobotsTxt;
