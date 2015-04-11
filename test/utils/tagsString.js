"use strict";
var tags = require("../../lib/internal/tags");

var voidElements = require("void-elements");



function tagsString(filterLevel, url)
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



module.exports = tagsString;
