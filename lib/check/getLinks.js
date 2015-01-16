"use strict";
var linkObj = require("./linkObj");

var parse5 = require("parse5");



/*
	Get a single attr value from a list. If multiple attrs of the
	same name exist, the last one takes priority.
*/
function getActualAttrValue(attrName, attrs)
{
	var attrValue;
	
	// Because last instance takes priority, loop backwards for speed
	for (var i=attrs.length-1; i>=0; i--)
	{
		if (attrs[i].name === attrName)
		{
			attrValue = attrs[i].value;
			break;
		}
	}
	
	return attrValue;
}



/*
	Checks tagName and attrs for links defined in options.
*/
function getLink(tagName, attrs, selfClosing, options)
{
	var optionsTagsAttrs = options.tags[tagName];
	
	if (optionsTagsAttrs !== undefined)
	{
		for (var i=0; i<optionsTagsAttrs.length; i++)
		{
			var attrName = optionsTagsAttrs[i];
			var attrValue = getActualAttrValue(attrName, attrs);
			
			if (typeof attrValue === "string")
			{
				var link = linkObj();
				link.temp.attrs = attrs;
				link.temp.selfClosing = selfClosing;
				
				link.tagName = tagName;
				link.attrName = attrName;
				link.tag = stringifyTag(link);
				link.url = /*ltrim(*/attrValue/*)*/;
				
				return link;
			}
		}
	}
	
	return false;
}



/*
	Parse HTML and find elements with URL attributes.
*/
function getLinks(html, options, callback)
{
	var linkCount = 0;
	var linkStack = [];
	
	// TODO :: try to have a single, reusable instance of parse5
	new parse5.SimpleApiParser(
	{
		// TODO :: use reusable functions?
		startTag: function(tagName, attrs, selfClosing)
		{
			var link = getLink(tagName, attrs, selfClosing, options);
			
			if (link !== false)
			{
				link.index = linkCount++;
				
				if (selfClosing === false)
				{
					link.text = "";	// for iteration
					linkStack.push(link);
				}
				else
				{
					callback(link);
				}
			}
		},
		endTag: function(tagName)
		{
			if ( linkStack.length>0 && linkStack[linkStack.length-1].tagName===tagName )
			{
				callback( linkStack.pop() );
			}
		},
		text: function(text)
		{
			for (var i=0; i<linkStack.length; i++)
			{
				linkStack[i].text += text;
			}
		}
	}).parse(html);
}



/*
	Trim whitespace on left side of string.
*/
/*function ltrim(str)
{
	var i;
	
	for (i=0; i<str.length; i++)
	{
		// If not a space char
		if (str.charCodeAt(i) !== 32) break;
	}
	
	if (i !== str.length-1) str = str.substring(i);
	
	return str;
}*/



/*
	Re-stringify an HTML tag object.
*/
function stringifyTag(link)
{
	var result = "<"+link.tagName;
	
	for (var i=0; i<link.temp.attrs.length; i++)
	{
		// TODO :: comment out double quotes in value?
		result += " "+ link.temp.attrs[i].name +'="'+ link.temp.attrs[i].value +'"';
	}
	
	if (link.temp.selfClosing)
	{
		result += "/>";
	}
	else
	{
		result += ">";
		
		if (link.text)
		{
			result += link.text;
			result += "</"+ link.tagName +">";
		}
	}
	
	return result;
}



module.exports = getLinks;
