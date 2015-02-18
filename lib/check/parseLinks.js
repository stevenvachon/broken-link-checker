"use strict";
var linkObj = require("./linkObj");
var resolve = require("./resolve");

var parse5 = require("parse5");
var voidElements = require("void-elements");



/*
	Gets a map of the actual value of each attr.
	
	parse5 will have already handled multiple attrs of the
	same name.
*/
function getAttrMap(attrs)
{
	var i;
	var len = attrs.length;
	var map = {};
	
	for (i=0; i<len; i++)
	{
		map[ attrs[i].name ] = attrs[i].value;
	}
	
	return map;
}



/*
	Checks for the first instance of
	<head><base href="…"/></head>
*/
function getBase(tagName, attrs, base)
{
	if (base.baseChecked===false && base.headChecked===false)
	{
		if (base.headOpen === false)
		{
			if (tagName === "head")
			{
				base.headOpen = true;
			}
		}
		else if (tagName === "base")
		{
			base.baseChecked = true;
			base.value = getAttrMap(attrs)["href"];
			
			if (base.value !== undefined)
			{
				// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
				base.value = base.value.trim();
			}
		}
	}
}



/*
	Find links defined in options by checking an HTML element's attrs.
*/
function getLinks(tagName, attrs, selfClosing, voidElement, selector, base, options, counters)
{
	var attrMap,attrName,link,links,url;
	var linkAttrs = options.tags[options.filterLevel][tagName];
	
	// If not a link element
	if (linkAttrs === undefined) return false;
	
	attrMap = getAttrMap(attrs);
	links = [];
	
	for (attrName in attrMap)
	{
		// If not a link attr
		if (linkAttrs[attrName] !== true) continue;
		
		// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
		url = attrMap[attrName].trim();
		
		link = linkObj(url);
		link.html.base = base;
		
		resolve.linkObj(link, options);
		
		// If link should be ignored, skip
		if (link.internal===true && options.excludeInternalLinks===true) continue;
		if (link.samePage===true && options.excludeLinksToSamePage===true) continue;
		if (options.excludedSchemes[link.url.parsed.protocolTruncated] === true) continue;
		
		link.html.attrMap = attrMap;
		link.html.attrName = attrName;
		link.html.attrs = attrs;
		link.html.index = counters.link++;
		link.html.selector = selector;
		link.html.selfClosing = selfClosing;
		link.html.tagName = tagName;
		link.html.voidElement = voidElement;
		
		link.html.tag = stringifyTag(link);
		
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
	Builds a CSS selector string to `tagName`. Optionally increments
	the parent's child count.
*/
function getSelector(elementStack, tagName, incrementChildren)
{
	var i;
	var len = elementStack.length;
	var selector = "";
	
	if (incrementChildren === true)
	{
		elementStack[len-1].children++;
	}
	
	if (len > 1)
	{
		// Skip __DOCUMENT element at index 0
		for (i=1; i<len; i++)
		{
			selector += elementStack[i].tagName;
			
			// html:nth-child(1) does not work with document.querySelect() or jQuery
			if ( (i===1 && elementStack[i].tagName==="html") === false )
			{
				// While we're at it, might as well do the same for <body>
				if ( (i===2 && elementStack[i].tagName==="body") === false )
				{
					selector += ":nth-child(" + elementStack[i-1].children + ")";
				}
			}
			
			selector += " > ";
		}
	}
	
	// Current tag has not yet (and may not be) added to stack
	selector += tagName + ":nth-child(" + elementStack[len-1].children + ")";
	
	return selector;
}



/*
	Parse HTML and find elements with URL attributes.
	
	Because elements can have multiple URL attributes, we populate
	a stack of link elements, each containing a list of link objects:
	[ element, element ]
	which, when zooming deeper looks like:
	[ [link,link] , [link] ]
	
	We also populate a stack of all elements in the tree leading up to
	the current element so that a CSS selector can be produced:
	[ element, element ]
	which, when zooming deeper looks like:
	[ {tagName:"a",children:0}, {tagName:"a",children:4} ]
*/
function parseLinks(html, options, handlers)
{
	var i,j,links,selector,voidElement;
	var base = { baseChecked:false, headChecked:false, headOpen:false, value:undefined };
	var elementStack = [{ tagName:"__DOCUMENT", children:0 }];
	var counters = { link:0 };	// a simple number does not persist across functions
	var linkElementStack = [];
	
	// TODO :: try to have a single, reusable instance of parse5
	new parse5.SimpleApiParser(
	{
		// TODO :: use reusable functions?
		startTag: function(tagName, attrs, selfClosing)
		{
			getBase(tagName, attrs, base);
			
			selector = getSelector(elementStack, tagName, true);
			
			voidElement = voidElements[tagName] === true;
			
			links = getLinks(tagName, attrs, selfClosing, voidElement, selector, base.value, options, counters);
			
			if (selfClosing===false && voidElement===false)
			{
				// Add element that is not yet closed to stack for tracking current selector
				elementStack.push({ tagName:tagName, children:0 });
			}
			
			// If no link(s)
			if (links === false) return;
			
			if (selfClosing===false && voidElement===false)
			{
				// Add element that is not yet closed to stack for tracking innerText
				linkElementStack.push(links);
			}
			else
			{
				// Run callback for each nested link (attribute)
				for (i=0; i<links.length; i++)
				{
					handlers.link( links[i] );
				}
			}
		},
		endTag: function(tagName)
		{
			// If end tag is same tagName as last element in stack
			if ( elementStack.length>0 && elementStack[elementStack.length-1].tagName===tagName )
			{
				// Remove last element from stack -- element is closed and is no longer part of the current selector
				elementStack.pop();
			}
			
			// If end tag is same tagName as last link element in stack
			if ( linkElementStack.length>0 && linkElementStack[linkElementStack.length-1][0].html.tagName===tagName )
			{
				// Remove last link element from stack -- element is closed and has no more innerText
				links = linkElementStack.pop();
				
				// Run callback for each nested link (attribute)
				for (i=0; i<links.length; i++)
				{
					handlers.link( links[i] );
				}
			}
			
			// If <base> not found but <head> closed, stop <base> checking
			if (base.headOpen===true && tagName==="head")
			{
				base.headChecked = true;
				base.headOpen = false;
			}
		},
		text: function(text)
		{
			// Append innerText to each link in stack
			for (i=0; i<linkElementStack.length; i++)
			{
				links = linkElementStack[i];
				
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
