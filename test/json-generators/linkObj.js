"use strict";
var fs = require("fs");
var path = require("path");

var utils = require("../utils");

var urls = 
{
	"remote absolute":    "http://fakeurl2.com/path/link.html?query#hash",
	"local absolute":     "http://fakeurl.com/path/link.html?query#hash",
	"root-path-relative": "/path/link.html?query#hash",
	"path-relative":      "path/link.html?query#hash",
	"resource-relative":  "link.html?query#hash",
	"query-relative":     "?query#hash",
	"hash-relative":      "#hash",
	"empty":              "",
	"undefined":          null
};



function generate()
{
	saveFile( path.normalize( __dirname + "/../json/linkObj.json" ) );
}



function generateData()
{
	var base,htmlBase,url;
	var output = {};
	
	for (url in urls)
	{
		for (base in urls)
		{
			for (htmlBase in urls)
			{
				output[
					url.toUpperCase() +" url"+ 
					" with "+ utils.a_an(base) +" "+ base.toUpperCase() +" base"+ 
					" and "+ htmlBase.toUpperCase() +" html base"
				] = {
					linkUrl: urls[url],
					baseUrl: urls[base],
					htmlBaseUrl: urls[htmlBase],
					
					skipOrOnly: "skip",
					resolvedLinkUrl: "",
					resolvedBaseUrl: "",
					internal: null,
					samePage: null
				};
			}
		}
	}
	
	return output;
}



function generateString()
{
	// Extra line break for unix/git
	return JSON.stringify(generateData(), null, "	") + "\n";
}



function saveFile(location)
{
	fs.writeFileSync(location, generateString());
	
	console.log("Written to: "+ location);
}



generate();
