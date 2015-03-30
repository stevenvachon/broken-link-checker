"use strict";
var callHandler = require("./callHandler");
var linkObj = require("./linkObj");

var parse5 = require("parse5");
var voidElements = require("void-elements");



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
function HtmlLinkParser(options, handlers)
{
	// No, this is not Underscore.js ;) -- it's just short
	var _ = {};
	
	// Parse session variables
	_.elementStack = [];
	_.htmlBase = {};
	_.linkCount = 0;
	_.linkElementsStack = [];
	
	// Per-link variables
	_.links = [];
	_.selector = "";
	_.voidElement = false;
	
	this.parserVars = _;
	
	// Argument variables
	this.handlers = handlers || {};
	this.options = options;
	
	this.parser = new parse5.SimpleApiParser(
	{
		startTag: handler_startTag.bind(this),
		endTag:   handler_endTag.bind(this),
		text:     handler_text.bind(this)
	});
}



HtmlLinkParser.prototype.parse = function(html)
{
	reset(this);
	
	this.parser.parse(html);
	
	callHandler.sync(this.handlers.complete, null);
};



//::: PRIVATE FUNCTIONS (with scope)



function handler_endTag(tagName)
{
	var _ = this.parserVars;
	
	// If end tag is same tagName as last element in stack
	if ( _.elementStack.length>0 && _.elementStack[_.elementStack.length-1].tagName===tagName )
	{
		// Remove last element from stack -- element is closed and is no longer part of the current selector
		_.elementStack.pop();
	}
	
	// If end tag is same tagName as last link element in stack
	if ( _.linkElementStack.length>0 && _.linkElementStack[_.linkElementStack.length-1][0].html.tagName===tagName )
	{
		// Remove last link element from stack -- element is closed and has no more innerText
		_.links = _.linkElementStack.pop();
		
		// Run callback for each nested link (attribute)
		for (var i=0; i<_.links.length; i++)
		{
			callHandler.sync(_.handlers.link, _.links[i]);
		}
	}
	
	// If <base> not found but <head> closed, stop <base> checking
	if (_.htmlBase.headOpen===true && tagName==="head")
	{
		_.htmlBase.headChecked = true;
		_.htmlBase.headOpen = false;
	}
}



function handler_startTag(tagName, attrs, selfClosing)
{
	var _ = this.parserVars;
	
	getBase(tagName, attrs, this);
	
	selector = getSelector(tagName, true, this);
	
	_.voidElement = voidElements[tagName] === true;
	
	_.links = getLinks(tagName, attrs, this);
	
	if (_.selfClosing===false && _.voidElement===false)
	{
		// Add element that is not yet closed to stack for tracking current selector
		_.elementStack.push({ tagName:tagName, children:0 });
	}
	
	// If no link(s)
	if (_.links === false) return;
	
	if (_.selfClosing===false && _.voidElement===false)
	{
		// Add element that is not yet closed to stack for tracking innerText
		_.linkElementStack.push(_.links);
	}
	else
	{
		// Run callback for each nested link (attribute)
		for (var i=0; i<_.links.length; i++)
		{
			callHandler.sync(_.handlers.link, _.links[i]);
		}
	}
}



function handler_text(text)
{
	var i,j;
	var _ = this.parserVars;
	
	// Append innerText to each link in stack
	for (i=0; i<_.linkElementStack.length; i++)
	{
		_.links = _.linkElementStack[i];
		
		for (j=0; j<_.links.length; j++)
		{
			_.links[j].html.text += text;
		}
	}
}



//::: PRIVATE FUNCTIONS (with no scope)



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
function getBase(tagName, attrs, instance)
{
	var _ = instance.parserVars;
	
	if (_.htmlBase.baseChecked===false && _.htmlBase.headChecked===false)
	{
		if (_.htmlBase.headOpen === false)
		{
			if (tagName === "head")
			{
				_.htmlBase.headOpen = true;
			}
		}
		else if (tagName === "base")
		{
			_.htmlBase.baseChecked = true;
			_.htmlBase.value = getAttrMap(attrs)["href"];
			
			if (_.htmlBase.value !== undefined)
			{
				// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
				_.htmlBase.value = _.htmlBase.value.trim();
			}
		}
	}
}



/*
	Find links defined in options by checking an HTML element's attrs.
*/
function getLinks(tagName, attrs, instance)
{
	var attrMap,attrName,link,links,url;
	var _ = instance.parserVars;
	var linkAttrs = _.options.tags[_.options.filterLevel][tagName];
	
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
		link.html.attrMap = attrMap;
		link.html.attrName = attrName;
		link.html.attrs = attrs;
		link.html.base = _.htmlBase;
		link.html.selector = _.selector;
		link.html.selfClosing = _.selfClosing;
		link.html.tagName = tagName;
		link.html.voidElement = _.voidElement;
		
		link.html.tag = stringifyTag(link);
		
		if (_.selfClosing===false && _.voidElement===false)
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
function getSelector(tagName, incrementChildren, instance)
{
	var i;
	var _ = instance.parserVars;
	var len = _.elementStack.length;
	var selector = "";
	
	if (incrementChildren === true)
	{
		_.elementStack[len-1].children++;
	}
	
	if (len > 1)
	{
		// Skip __DOCUMENT element at index 0
		for (i=1; i<len; i++)
		{
			selector += _.elementStack[i].tagName;
			
			// html:nth-child(1) does not work with document.querySelect() or jQuery
			if ( (i===1 && _.elementStack[i].tagName==="html") === false )
			{
				// While we're at it, might as well do the same for <body>
				if ( (i===2 && _.elementStack[i].tagName==="body") === false )
				{
					selector += ":nth-child(" + _.elementStack[i-1].children + ")";
				}
			}
			
			selector += " > ";
		}
	}
	
	// Current tag has not yet (and may not be) added to stack
	selector += tagName + ":nth-child(" + _.elementStack[len-1].children + ")";
	
	return selector;
}



/*
	Reset instance variables for next parse.
*/
function reset(instance)
{
	var _ = instance.parserVars;
	
	_.elementStack.length = 0;
	_.elementStack.push({ tagName:"__DOCUMENT", children:0 });
	
	_.htmlBase.baseChecked = false;
	_.htmlBase.headChecked = false;
	_.htmlBase.headOpen = false;
	_.htmlBase.value = undefined;
	
	_.linkCount = 0;
	
	_.linkElementsStack.length = 0;
	
	// Per-link variables
	_.links.length = 0;
	_.selector = "";
	_.voidElement = false;
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



module.exports = HtmlLinkParser;
