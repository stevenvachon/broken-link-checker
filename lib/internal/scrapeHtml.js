"use strict";
var linkObj = require("./linkObj");
var tags    = require("./tags");

var condenseWhitespace = require("condense-whitespace");
var isStream = require("is-stream");
var isString = require("is-string");
var parse5 = require("parse5");
var parseMetaRefresh = require("http-equiv-refresh");

var maxFilterLevel = tags[tags.length - 1];



/*
	Parse and scrape an HTML stream/string for links.
*/
function scrapeHtml(input)
{
	return new Promise( function(resolve, reject)
	{
		if (isStream(input) === true)
		{
			var parser = new parse5.ParserStream();
			
			parser.on("finish", function()
			{
				resolve( scrapeTree(parser.document) );
			});
			
			input.pipe(parser);
		}
		else if (isString(input) === true)
		{
			resolve( scrapeTree( parse5.parse(input) ) );
		}
		else
		{
			reject("Invalid input");
		}
	});
};



//::: PRIVATE FUNCTIONS



/*
	Traverses the root node to locate the first `<base href>` element.
	
	If no `href` attribute exists, the element is ignored and possible successors
	are considered.
*/
function findBase(rootNode)
{
	var i;
	var base = null;
	
	walk(rootNode, function(node)
	{
		// `<base>` can be anywhere, not just within `<head>`
		if (node.nodeName === "base")
		{
			for (i=0; i<node.attrs.length; i++)
			{
				if (node.attrs[i].name === "href")
				{
					base = node.attrs[i].value;
					
					// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
					base = base.trim();
					
					// Kill walk
					return false;
				}
			}
		}
	});
	
	return base;
}



/*
	Traverses the root node to locate links that match filters.
*/
function findLinks(rootNode, callback)
{
	var attrMap,attrName,i,link,linkAttrs,url;
	
	walk(rootNode, function(node)
	{
		linkAttrs = maxFilterLevel[node.nodeName];
		
		// If a supported element
		if (linkAttrs != null)
		{
			attrMap = getAttrMap(node.attrs);
			
			// Faster to loop through Arrays than Objects
			for (i=0; i<node.attrs.length; i++)
			{
				attrName = node.attrs[i].name;
				url = null;
				
				// If a supported attribute
				if (linkAttrs[attrName] === true)
				{
					// Special case for `<meta http-equiv="refresh" content="5; url=redirect.html">`
					if (node.nodeName==="meta" && attrName==="content")
					{
						if (attrMap["http-equiv"].toLowerCase() === "refresh")
						{
							url = parseMetaRefresh( attrMap[attrName] ).url;
						}
					}
					else
					{
						// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
						url = attrMap[attrName].trim();
					}
					
					if (url != null)
					{
						callback(node, attrMap, attrName, url);
					}
				}
			}
		}
	});
}



/*
	Find the `<html>` element.
*/
function findRootNode(document)
{
	var i;
	var rootNodes = document.childNodes;
	
	for (i=0; i<rootNodes.length; i++)
	{
		// Doctypes have no `childNodes` property
		if (rootNodes[i].childNodes != null)
		{
			return rootNodes[i];
		}
	}
}



/*
	Gets a map of the actual value of each attr.
	
	parse5 will have already handled multiple attrs of the
	same name.
*/
function getAttrMap(attrs)
{
	var i;
	var map = {};
	
	for (i=0; i<attrs.length; i++)
	{
		map[ attrs[i].name ] = attrs[i].value;
	}
	
	return map;
}



/*
	Find a node's `:nth-child()` index among its siblings.
*/
function getNthIndex(node)
{
	var child,i;
	var count = 0;
	var parentsChildren = node.parentNode.childNodes;
	
	for (i=0; i<parentsChildren.length; i++)
	{
		child = parentsChildren[i];
		
		if (child !== node)
		{
			// Exclude text and comments nodes
			if (child.nodeName[0] !== "#")
			{
				count++;
			}
		}
		else
		{
			break;
		}
	}
	
	// `:nth-child()` indices don't start at 0
	return count+1;
}



/*
	Builds a CSS selector that matches `node`.
*/
function getSelector(node)
{
	var name;
	var selector = [];
	
	while (node.nodeName !== "#document")
	{
		name = node.nodeName;
		
		// Only one of these are ever allowed -- so, index is unnecessary
		if (name!=="html" && name!=="body" & name!=="head")
		{
			name += ":nth-child("+ getNthIndex(node) +")";
		}
		
		// Building backwards
		selector.push(name);
		
		node = node.parentNode;
	}
	
	return selector.reverse().join(" > ");
}



function getText(node)
{
	var text = null;
	
	if (node.childNodes.length > 0)
	{
		text = "";
		
		walk(node, function(node)
		{
			if (node.nodeName === "#text")
			{
				text += node.value;
			}
		});
		
		// TODO :: don't normalize if within <pre> ?
		// TODO :: use "normalize-html-whitespace" package?
		text = condenseWhitespace(text);
	}
	
	return text;
}



/*
	Scrape a parsed HTML document for links.
*/
function scrapeTree(document)
{
	var base,link,links,rootNode;
	
	links = [];
	rootNode = findRootNode(document);
	
	if (rootNode != null)
	{
		base = findBase(rootNode);
		
		findLinks(rootNode, function(node, attrMap, attrName, url)
		{
			link = linkObj(url);
			link.html.attrs = attrMap;
			link.html.attrName = attrName;
			link.html.base = base;
			link.html.index = links.length;
			link.html.selector = getSelector(node);
			link.html.tag = stringifyNode(node);
			link.html.tagName = node.nodeName;
			link.html.text = getText(node);
			
			links.push(link);
		});
	}
	
	return links;
}



/*
	Serialize an HTML node back to a string.
*/
function stringifyNode(node)
{
	var result = "<"+node.nodeName;
	
	for (var i=0; i<node.attrs.length; i++)
	{
		result += " "+ node.attrs[i].name +'="'+ node.attrs[i].value +'"';
	}
	
	result += ">";
	
	return result;
}



// TODO :: contribute these to npmjs.com/dom-walk
function walk(node, callback)
{
	var childNode,i;
	
	if (callback(node) === false) return false;
	
	if (node.childNodes != null)
	{
		i = 0;
		childNode = node.childNodes[i];
	}
	
	while (childNode != null)
	{
		if (walk(childNode, callback) === false) return false;
		
		childNode = node.childNodes[++i];
	}
}
// http://www.javascriptcookbook.com/article/Traversing-DOM-subtrees-with-a-recursive-walk-the-DOM-function/
// Modified
/*function walk(node, callback)
{
	if (callback(node) === false) return false;
	
	node = node.firstChild;
	
	while (node != null)
	{
		if (walk(node, callback) === false) return false;
		
		node = node.nextSibling;
	}
}*/



module.exports = scrapeHtml;
