"use strict";
var linkObj = require("./linkObj");

var parse5 = require("parse5");



/*
	Gets a map of the actual value of each attr. If multiple attrs of the
	same name exist, the last one takes priority.
	
	Note: parse5 1.3.0 ignores redundant attributes
	
	{ attrName1: { index:0, value:"attrValue" },
	  attrName2: { index:1, value:"attrValue" } }
*/
function getAttrMap(attrs, counters)
{
	var attr;
	var map = {};
	
	for (var i=0; i<attrs.length; i++)
	{
		attr = attrs[i];
		
		if ( map[attr.name] === undefined )
		{
			map[attr.name] = 
			{
				index: counters.link++,
				value: attr.value
			};
		}
		else
		{
			map[attr.name].value = attr.value;
		}
	}
	
	return map;
}



/*
	Find links defined in options by checking an HTML element's attrs.
*/
function getLinks(tagName, attrs, selfClosing, options, counters)
{
	var attrMap,attrName,link,links;
	var definedLinkAttrs = options.tags[tagName];
	
	// If not a link tag or no attributes
	if (definedLinkAttrs===undefined || attrs.length===0) return false;
	
	attrMap = getAttrMap(attrs, counters);
	links = [];
	
	for (attrName in attrMap)
	{
		// If not a link attr
		if (definedLinkAttrs[attrName] !== true) break;
		
		link = linkObj(attrMap[attrName].value);
		link.attrs = attrs;
		link.selfClosing = selfClosing;
		
		link.index = attrMap[attrName].index;
		link.tagName = tagName;
		link.attrName = attrName;
		link.tag = stringifyTag(link);
		//link.url = ltrim(attrMap[attrName].value);
		
		if (selfClosing === false)
		{
			link.text = "";	// ready for iteration
		}
		
		links.push(link);
	}
	
	// Don't return an empty array -- be consistent with non-link tags
	return links.length>0 ? links : false;
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
	Parse HTML and find elements with URL attributes.
	
	Because elements can have multiple URL attributes, we populate
	a stack of "elements", each containing a list of link objects:
	[ element, element ]
	which, when zooming deeper looks like:
	[ [link,link] , [link] ]
	
*/
function parseLinks(html, options, callback)
{
	var i,j,links;
	var elementStack = [];
	var counters = { link:0 };	// a simple number does not persist across functions
	
	// TODO :: try to have a single, reusable instance of parse5
	new parse5.SimpleApiParser(
	{
		// TODO :: use reusable functions?
		startTag: function(tagName, attrs, selfClosing)
		{
			links = getLinks(tagName, attrs, selfClosing, options, counters);
			
			// If no link(s)
			if (links === false) return;
			
			if (selfClosing === false)
			{
				// Add element that is not yet closed to stack for tracking innerText
				elementStack.push(links);
			}
			else
			{
				// Run callback for each nested link
				for (i=0; i<links.length; i++)
				{
					callback( links[i] );
				}
			}
		},
		endTag: function(tagName)
		{
			// If end tag is same tagName as last element in stack
			if ( elementStack.length>0 && elementStack[elementStack.length-1][0].tagName===tagName )
			{
				// Remove last element from stack -- element is closed and has no more innerText
				links = elementStack.pop();
				
				// Run callback for each nested link
				for (i=0; i<links.length; i++)
				{
					callback( links[i] );
				}
			}
		},
		text: function(text)
		{
			// Append innerText to each link in stack
			for (i=0; i<elementStack.length; i++)
			{
				links = elementStack[i];
				
				for (j=0; j<links.length; j++)
				{
					links[j].text += text;
				}
			}
		}
	}).parse(html);
}



/*
	Re-stringify an HTML tag object.
*/
function stringifyTag(link)
{
	var result = "<"+link.tagName;
	
	for (var i=0; i<link.attrs.length; i++)
	{
		result += " "+ link.attrs[i].name +'="'+ link.attrs[i].value +'"';
	}
	
	if (link.selfClosing)
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



module.exports = parseLinks;
