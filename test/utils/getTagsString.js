"use strict";
var voidElements = require("void-elements");

var tags = require("../../lib/internal/tags");



function getTagsString(filterLevel, url)
{
	var attrName,html,tag,tagName;
	var filteredTags = tags[filterLevel];
	var html = "";
	
	for (tagName in filteredTags)
	{
		html += '<'+tagName;
		
		tag = filteredTags[tagName];
		
		for (attrName in tag)
		{
			html += ' '+attrName+'="'+url+'"';
		}
		
		html += '>';
		
		if (voidElements[tagName] !== true)
		{
			html += 'link</'+tagName+'>';
		}
	}
	
	return html;
}



module.exports = getTagsString;
