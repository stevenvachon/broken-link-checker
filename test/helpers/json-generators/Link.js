"use strict";
const {normalize:normalizePath} = require("path");
const {writeFileSync} = require("fs");

const urls =
{
	       "remote absolute": "https://domain2.com/dir2/file2.html?query2#hash2",
	        "local absolute":  "http://domain1.com/dir1/file1.html?query1#hash1",
	"remote scheme-relative":       "//domain2.com/dir2/file2.html?query2#hash2",
	 "local scheme-relative":       "//domain1.com/dir1/file1.html?query1#hash1",
	    "root-path-relative":                     "/dir/file.html?query#hash",
	         "path-relative":                      "dir/file.html?query#hash",
	     "resource-relative":                          "file.html?query#hash",
	        "query-relative":                                   "?query#hash",
	         "hash-relative":                                         "#hash",
	                 "empty": "",
	                  "null": null
};



const generate = () => saveFile( normalizePath(`${__dirname}/../json/Link.json`) );



const generateData = () =>
{
	const output = {};

	for (let url in urls)
	{
		for (let base in urls)
		{
			for (let htmlBase in urls)
			{
				output[`${url.toUpperCase()} url with ${base.toUpperCase()} base and ${htmlBase.toUpperCase()} html base`] =
				{
					linkUrl: urls[url],
					baseUrl: urls[base],
					htmlBaseUrl: urls[htmlBase],

					skipOrOnly: "skip",

					// Placeholder values for manual editing
					resolvedLinkUrl: "",
					resolvedBaseUrl: "",
					rebasedLinkUrl: "",
					rebasedBaseUrl: "",
					internal: null,
					samePage: null
				};
			}
		}
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
