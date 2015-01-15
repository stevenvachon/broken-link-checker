"use strict";
var linkObj = require("./linkObj");

var parse5 = require("parse5");



/*
	If attr exists, complete linkObj and invoke callback.
*/
function checkAttr(attrName, link, callback)
{
	var attrValue = getActualAttrValue(attrName, link.temp.attrs);
	
	if (typeof attrValue === "string")
	{
		link.attrName = attrName;
		link.tag = stringifyTag(link);
		//link.text = "not yet implemented";	// TODO :: link text (if available)
		link.url = /*ltrim(*/attrValue/*)*/;
		
		callback(link);
	}
}



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
	Parse HTML and find elements with URL attributes.
*/
function getLinks(html, callback)
{
	// TODO :: try to have a single, reusable instance of parse5
	new parse5.SimpleApiParser(
	{
		// TODO :: use reusable functions?
		startTag: function(tagName, attrs, selfClosing)
		{
			var link = linkObj();
			link.tagName = tagName;
			link.temp.attrs = attrs;
			link.temp.selfClosing = selfClosing;
			
			switch (tagName)
			{
				case "a":
				case "area":
				case "base":
				case "link":
				{
					checkAttr("href", link, callback);
					break;
				}
				case "blockquote":
				case "del":
				case "ins":
				case "q":
				{
					checkAttr("cite", link, callback);
					break;
				}
				case "form":
				{
					checkAttr("action", link, callback);
					break;
				}
				case "head":
				{
					checkAttr("profile", link, callback);
					break;
				}
				case "img":
				{
					checkAttr("longdesc", link, callback);
					checkAttr("src",      link, callback);
					checkAttr("usemap",   link, callback);
					break;
				}
				case "input":
				{
					checkAttr("src",    link, callback);
					checkAttr("usemap", link, callback);
					break;
				}
				case "object":
				{
					checkAttr("classid",  link, callback);
					checkAttr("codebase", link, callback);
					checkAttr("data",     link, callback);
					checkAttr("usemap",   link, callback);
					break;
				}
				case "script":
				{
					checkAttr("for", link, callback);
					checkAttr("src", link, callback);
					break;
				}
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
