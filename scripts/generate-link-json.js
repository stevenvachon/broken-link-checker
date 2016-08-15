/* eslint-disable quote-props, sort-keys */
"use strict";
const {normalize:normalizePath} = require("path");
const {promises: {writeFile}} = require("fs");



const urls =
{
	       "external absolute": "https://domain2.com/dir2/file2.html?query2#hash2",
	       "internal absolute":  "http://domain1.com/dir1/file1.html?query1#hash1",
	"external scheme-relative":       "//domain2.com/dir2/file2.html?query2#hash2",
	"internal scheme-relative":       "//domain1.com/dir1/file1.html?query1#hash1",
	      "root-path-relative":                     "/dir/file.html?query#hash",
	           "path-relative":                      "dir/file.html?query#hash",
	       "resource-relative":                          "file.html?query#hash",
	          "query-relative":                                   "?query#hash",
	           "hash-relative":                                         "#hash",
	                   "empty": "",
	                    "null": null
};



const generate = () => saveFile( normalizePath(`${__dirname}/../test/fixtures-json/Link.json`) );



const generateData = () =>
{
	const entries = Object.entries(urls);

	return entries.reduce((result, [linkType, linkURL]) =>
	{
		entries.forEach(([baseType, baseURL]) =>
		{
			entries.forEach(([htmlBaseType, htmlBaseURL]) =>
			{
				result[`${linkType.toUpperCase()} url with ${baseType.toUpperCase()} base and ${htmlBaseType.toUpperCase()} html base`] =
				{
					linkURL,
					baseURL,
					htmlBaseURL,

					skipOrOnly: "skip",

					// Placeholder values for manual editing
					resolvedLinkURL: "",
					resolvedBaseURL: "",
					rebasedLinkURL: "",
					rebasedBaseURL: "",
					internal: null,
					samePage: null
				};
			});
		});

		return result;
	}, {});
};



// Extra line break for unix/git
const generateString = () => `${JSON.stringify(generateData(), null, "\t")}\n`;



const saveFile = async location =>
{
	await writeFile(location, generateString());

	// eslint-disable-next-line no-console
	console.log(`Written to: ${location}`);
};



generate();
