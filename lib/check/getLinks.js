"use strict";
var parse5 = require("parse5");



/*
	If attr exists, create tagObj and invoke callback.
*/
function checkAttr(attrName, tagObj, callback)
{
	var attrValue = getActualAttrValue(attrName, tagObj.attrs);
	
	if (typeof attrValue==="string" && attrValue!=="")
	{
		tagObj.attrName = attrName;
		tagObj.tag = stringifyTag(tagObj);
		//tagObj.text = "not yet implemented";	// TODO :: link text (if available)
		tagObj.url = ltrim(attrValue);
		
		// These are not needed outside of this file
		// Effectively turns tagObj into linkObj
		delete tagObj.attrs;
		delete tagObj.selfClosing;
		
		callback(tagObj);
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
			var tagObj = 
			{
				tagName: tagName,
				attrs: attrs,				// removed later
				selfClosing: selfClosing	// removed later
			};
			
			switch (tagName)
			{
				case "a":
				case "area":
				case "base":
				case "link":
				{
					checkAttr("href", tagObj, callback);
					break;
				}
				case "blockquote":
				case "del":
				case "ins":
				case "q":
				{
					checkAttr("cite", tagObj, callback);
					break;
				}
				case "form":
				{
					checkAttr("action", tagObj, callback);
					break;
				}
				case "head":
				{
					checkAttr("profile", tagObj, callback);
					break;
				}
				case "img":
				{
					checkAttr("longdesc", tagObj, callback);
					checkAttr("src",      tagObj, callback);
					checkAttr("usemap",   tagObj, callback);
					break;
				}
				case "input":
				{
					checkAttr("src",    tagObj, callback);
					checkAttr("usemap", tagObj, callback);
					break;
				}
				case "object":
				{
					checkAttr("classid",  tagObj, callback);
					checkAttr("codebase", tagObj, callback);
					checkAttr("data",     tagObj, callback);
					checkAttr("usemap",   tagObj, callback);
					break;
				}
				case "script":
				{
					checkAttr("for", tagObj, callback);
					checkAttr("src", tagObj, callback);
					break;
				}
			}
		}
	}).parse(html);
}



/*
	Trim whitespace on left side of string.
*/
function ltrim(str)
{
	var i;
	
	for (i=0; i<str.length; i++)
	{
		// If not a space char
		if (str.charCodeAt(i) !== 32) break;
	}
	
	if (i !== str.length-1) str = str.substring(i);
	
	return str;
}



/*
	Re-stringify an HTML tag object.
*/
function stringifyTag(tagObj)
{
	var result = "<"+tagObj.tagName;
	
	for (var i=0; i<tagObj.attrs.length; i++)
	{
		// TODO :: comment out double quotes in value?
		result += " "+ tagObj.attrs[i].name +'="'+ tagObj.attrs[i].value +'"';
	}
	
	if (tagObj.selfClosing)
	{
		result += "/>";
	}
	else
	{
		result += ">";
		
		if (tagObj.text)
		{
			result += tagObj.text;
			result += "</"+ tagObj.tagName +">";
		}
	}
	
	return result;
}



module.exports = getLinks;
