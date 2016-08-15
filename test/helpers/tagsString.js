"use strict";
const tags = require("../../lib/internal/tags");

const voidElements = require("void-elements");



const stringifyTag = (tagName, attrs, url) =>
{
	const isTableNode = tagName==="tbody" || tagName==="td" || tagName==="tfoot" || tagName==="th" || tagName==="thead" || tagName==="tr";

	let html = ``;

	if (isTableNode)
	{
		html += `<table>`;
	}

	html += `<${tagName}`;

	for (let attrName in attrs)
	{
		// Special case for `<meta http-equiv="refresh" content="5; url=redirect.html">`
		if (tagName==="meta" && attrName==="content")
		{
			html += ` http-equiv="refresh" content="5; url=`;
		}
		else
		{
			html += ` ${attrName}="`;
		}

		html += `${url}"`;
	}

	html += `>`;

	if (tagName!=="body" && tagName!=="head" && tagName!=="html" && voidElements[tagName]!==true)
	{
		html += `link</${tagName}>`;
	}

	if (isTableNode)
	{
		html += `</table>`;
	}

	return html;
};



const tagsString = (filterLevel, frameset, url) =>
{
	const filteredTags = tags[filterLevel];
	let html = "";

	if (filteredTags.html !== undefined)
	{
		html += stringifyTag("html", filteredTags.html, url);
	}

	if (filteredTags.head !== undefined)
	{
		html += stringifyTag("head", filteredTags.head, url);
		html += `</head>`;
	}



	if (frameset)
	{
		html += `<frameset>`;
		html += stringifyTag("frame", filteredTags.frame, url);
		html += `</frameset>`;
	}
	else
	{
		if (filteredTags.body !== undefined)
		{
			html += stringifyTag("body", filteredTags.body, url);
		}

		for (let tagName in filteredTags)
		{
			if (tagName === "*")
			{
				html += stringifyTag("tag", filteredTags[tagName], url);
			}
			else if (tagName!=="body" && tagName!=="frame" && tagName!=="head" && tagName!=="html")
			{
				html += stringifyTag(tagName, filteredTags[tagName], url);
			}
		}

		if (filteredTags.body !== undefined)
		{
			html += `</body>`;
		}
	}

	if (filteredTags.html !== undefined)
	{
		html += `</html>`;
	}

	return html;
};



module.exports = tagsString;
