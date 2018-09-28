"use strict";
var linkObj = require("./linkObj");
var tags    = require("./tags");

var condenseWhitespace = require("condense-whitespace");
var parseMetaRefresh = require("http-equiv-refresh");
var RobotDirectives = require("robot-directives");

var maxFilterLevel = tags[tags.length - 1];



/*
	Scrape a parsed HTML document/tree for links.
*/
function scrapeHtml(document, robots)
{
	var link,links,preliminaries,rootNode;
	
	rootNode = findRootNode(document);
	
	if (rootNode != null)
	{
		preliminaries = findPreliminaries(rootNode, robots);
		links = [];
		
		findLinks(rootNode, function(node, attrName, url)
		{
			link = linkObj(url);

			link.html.attrs = node.attribs;
			link.html.attrName = attrName;
			link.html.base = preliminaries.base;
			link.html.index = links.length;
			link.html.selector = getSelector(node);
			link.html.tag = stringifyNode(node);
			link.html.tagName = node.tagName;
			link.html.text = getText(node);

			// If not a "fake" (duplicated) element, as a result of adoption
			if (node.__location !== undefined)
			{
				link.html.location = node.__location.attrs[attrName];
			}
			
			links.push(link);
		});
	}
	
	return links;
}



//::: PRIVATE FUNCTIONS



/*
	Traverses the root node to locate links that match filters.
*/
function findLinks(rootNode, callback)
{
	var attrName,i,linkAttrs,url;
	
	walk(rootNode, function(node)
	{
		linkAttrs = maxFilterLevel[node.tagName];
		
		// If a supported element
		if (linkAttrs != null)
		{
			
			// Faster to loop through Arrays than Objects
			for (var attrName in node.attribs)
			{
				url = null;
				
				// If a supported attribute
				if (linkAttrs[attrName] === true)
				{
					// Special case for `<meta http-equiv="refresh" content="5; url=redirect.html">`
					if (node.tagName==="meta" && attrName==="content")
					{
						if (node.attribs["http-equiv"]!=null && node.attribs["http-equiv"].toLowerCase()==="refresh")
						{
							url = parseMetaRefresh( node.attribs[attrName] ).url;
						}
					}
					else
					{
						// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
						url = node.attribs[attrName].trim();
					}
					
					if (url != null)
					{
						callback(node, attrName, url);
					}
				}
			}
		}
	});
}



/*
	Traverses the root node to locate preliminary elements/data.
	
	<base href/>
		
		Looks for the first instance. If no `href` attribute exists,
		the element is ignored and possible successors are considered.
	
	<meta name content/>
		
		Looks for all robot instances and cascades the values.
*/
function findPreliminaries(rootNode, robots)
{
	var name;
	var find = {
		base: true,
		robots: robots != null
	};
	var found = {
		base: false
	};
	var result = {
		base: null
	};
	
	walk(rootNode, function(node)
	{
		switch (node.tagName)
		{
			// `<base>` can be anywhere, not just within `<head>`
			case "base":
			{
				if (find.base===true && found.base===false && node.attribs.href!=null)
				{
					// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
					result.base = node.attribs.href.trim();
					
					found.base = true;
				}
				
				break;
			}
			// `<meta>` can be anywhere
			case "meta":
			{
				if (find.robots===true && node.attribs.name!=null && node.attribs.content!=null)
				{
					name = node.attribs.name.trim().toLowerCase();
					
					switch (name)
					{
						case "description":
						case "keywords":
						{
							break;
						}
						// Catches all because we have "robots" and countless botnames such as "googlebot"
						default:
						{
							if (name==="robots" || RobotDirectives.isBot(name)===true)
							{
								robots.meta(name, node.attribs.content);
							}
						}
					}
				}
				
				break;
			}
		}
		
		if (found.base===true && find.robots===false)
		{
			// Kill walk
			return false;
		}
	});
	
	return result;
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
	Find a node's `:nth-child()` index among its siblings.
*/
function getNthIndex(node)
{
	var child,i;
	var count = 0;
	var parentsChildren = node.parentNode.childNodes;
	var numParentsChildren = parentsChildren.length;
	
	for (i=0; i<numParentsChildren; i++)
	{
		child = parentsChildren[i];
		
		if (child !== node)
		{
			// Exclude text and comments nodes
			if (child.type !== "text") // XXX comment node?
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
	
	while (node.tagName !== "root")
	{
		name = node.tagName;
		
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
			if (node.type === "text")
			{
				text += node.data;
			}
		});
		
		// TODO :: don't normalize if within <pre> ? use "normalize-html-whitespace" package if so
		text = condenseWhitespace(text);
	}
	
	return text;
}



/*
	Serialize an HTML node back to a string.
*/
function stringifyNode(node)
{
	var result = "<"+node.tagName;
	
	for (var attrName in node.attribs)
	{
		result += " "+ attrName +'="'+ node.attribs[attrName] +'"';
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
