"use strict";
var linkObj = require("./linkObj");

var parse5 = require("parse5");
var voidElements_array = require("void-elements");

// Maps have faster lookup -- won't be necessary with void-elements v2.0
var voidElements = {};
for (var i=0; i<voidElements_array.length; i++)
{
	voidElements[ voidElements_array[i] ] = true;
}



/*
	Gets a map of the actual value of each attr. If multiple attrs of the
	same name exist, the first one takes priority.
*/
function getAttrMap(attrs)
{
	var attr,i;
	var len = attrs.length;
	var map = {};
	
	for (i=0; i<len; i++)
	{
		attr = attrs[i];
		
		if (map.hasOwnProperty(attr.name) === false)
		{
			map[attr.name] = attr.value;
		}
	}
	
	return map;
}



/*
	Find links defined in options by checking an HTML element's attrs.
*/
function getLinks(tagName, attrs, selfClosing, voidElement, options, counters)
{
	var attrMap,attrName,clickableLinkAttrs,link,links,url;
	var linkAttrs = options.tags[options.filterLevel][tagName];
	
	// If not a link tag or no attributes
	if (linkAttrs===undefined || attrs.length===0) return false;
	
	clickableLinkAttrs = options.tags[0][tagName];
	attrMap = getAttrMap(attrs);
	links = [];
	
	for (attrName in attrMap)
	{
		// If not a link attr
		if (linkAttrs[attrName] !== true) continue;
		
		url = attrMap[attrName];
		
		// If local link, skip
		if (url==="" && clickableLinkAttrs!==undefined && clickableLinkAttrs[attrName]===true && options.excludeEmptyAnchors===true) continue;
		if (url[0] === "#") continue;
		
		link = linkObj(url);
		link.html.attrMap = attrMap;
		link.html.attrs = attrs;
		link.html.selfClosing = selfClosing;
		link.html.voidElement = voidElement;
		
		link.html.index = counters.link++;
		link.html.tagName = tagName;
		link.html.attrName = attrName;
		link.html.tag = stringifyTag(link);
		//link.url.original = ltrim(url);
		
		if (selfClosing===false && voidElement===false)
		{
			link.html.text = "";	// ready for iteration
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
function parseLinks(html, options, handlers)
{
	var i,j,links;
	var elementStack = [];
	var counters = { link:0 };	// a simple number does not persist across functions
	var voidElement;
	
	// TODO :: try to have a single, reusable instance of parse5
	new parse5.SimpleApiParser(
	{
		// TODO :: use reusable functions?
		startTag: function(tagName, attrs, selfClosing)
		{
			voidElement = voidElements.hasOwnProperty(tagName) === true;
			
			links = getLinks(tagName, attrs, selfClosing, voidElement, options, counters);
			
			// If no link(s)
			if (links === false) return;
			
			if (selfClosing===false && voidElement===false)
			{
				// Add element that is not yet closed to stack for tracking innerText
				elementStack.push(links);
			}
			else
			{
				// Run callback for each nested link
				for (i=0; i<links.length; i++)
				{
					handlers.link( links[i] );
				}
			}
		},
		endTag: function(tagName)
		{
			// If end tag is same tagName as last element in stack
			if ( elementStack.length>0 && elementStack[elementStack.length-1][0].html.tagName===tagName )
			{
				// Remove last element from stack -- element is closed and has no more innerText
				links = elementStack.pop();
				
				// Run callback for each nested link
				for (i=0; i<links.length; i++)
				{
					handlers.link( links[i] );
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
					links[j].html.text += text;
				}
			}
		}
	}).parse(html);
	
	// Done parsing
	handlers.complete();
}



/*
	Re-stringify an HTML tag object.
*/
function stringifyTag(link)
{
	var result = "<"+link.html.tagName;
	
	for (var i=0; i<link.html.attrs.length; i++)
	{
		result += " "+ link.html.attrs[i].name +'="'+ link.html.attrs[i].value +'"';
	}
	
	if (link.html.selfClosing === true)
	{
		result += "/>";
	}
	else if (link.html.voidElement === true)
	{
		result += ">";
	}
	else
	{
		result += ">";
		
		if (typeof link.html.text === "string")
		{
			result += link.html.text;
			result += "</"+ link.html.tagName +">";
		}
	}
	
	return result;
}



module.exports = parseLinks;
