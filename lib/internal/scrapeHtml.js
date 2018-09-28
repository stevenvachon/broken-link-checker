"use strict";
const Link = require("./Link");
const tags = require("./tags");

const condenseWhitespace = require("condense-whitespace");
const list2Array = require("list-to-array");
const parseMetaRefresh = require("http-equiv-refresh");
const parseSrcset = require("parse-srcset");
const RobotDirectives = require("robot-directives");

const maxFilterLevel = tags[tags.length - 1];



/*
	Traverses the root node to locate links that match filters.
*/
function findLinks(rootNode, callback)
{
	const allNodeAttrs = maxFilterLevel["*"];

	walk(rootNode, node =>
	{
		if (node.type !== "text")
		{
			const filteredNodeAttrs = maxFilterLevel[node.tagName] || {};

			Object.keys(node.attribs || {}).forEach(attrName =>
			{
				let url = null;

				// If a supported attribute
				if (filteredNodeAttrs[attrName] || allNodeAttrs[attrName])
				{
					switch (attrName)
					{
						case "content":
						{
							// Special case for `<meta http-equiv="refresh" content="5; url=redirect.html">`
							if (node.attribs["http-equiv"]!=null && node.attribs["http-equiv"].toLowerCase()==="refresh")
							{
								url = parseMetaRefresh( node.attribs[attrName] ).url;
							}

							break;
						}
						case "ping":
						{
							url = list2Array( node.attribs[attrName], "," );
							break;
						}
						case "srcset":
						{
							url = parseSrcset( node.attribs[attrName] ).map(image => image.url);
							break;
						}
						default:
						{
							// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
							url = node.attribs[attrName].trim();
						}
					}

					if (Array.isArray(url))
					{
						url.forEach(_url => callback(node, attrName, _url));
					}
					else if (url != null)
					{
						callback(node, attrName, url);
					}
				}
			});
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
	const result = { base:null };

	walk(rootNode, ({attribs, tagName}) =>
	{
		switch (tagName)
		{
			// `<base>` can be anywhere, not just within `<head>`
			case "base":
			{
				if (result.base==null && attribs.href!=null)
				{
					// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
					result.base = attribs.href.trim();
				}

				break;
			}
			// `<meta>` can be anywhere
			case "meta":
			{
				if (robots && attribs.name!=null && attribs.content!=null)
				{
					const name = attribs.name.trim().toLowerCase();

					if (name==="robots" || RobotDirectives.isBot(name))
					{
						robots.meta(name, attribs.content);
					}
				}

				break;
			}
		}

		if (result.base!=null && !robots)
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
	return document.childNodes.find(childNode =>
	{
		// Doctypes have no `childNodes` property
		// HTML can only have one true root node
		if (childNode.childNodes != null)
		{
			return childNode;
		}
	});
}



/*
	Find a node's `:nth-child()` index among its siblings.
*/
function getNthIndex(node)
{
	const parentsChildren = node.parentNode.childNodes;
	const numParentsChildren = parentsChildren.length;
	let count = 0;

	for (let i=0; i<numParentsChildren; i++)
	{
		const child = parentsChildren[i];

		if (child !== node)
		{
			// Exclude text and comments nodes
			if (child.type !== "text")
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
	return ++count;
}



/*
	Builds a CSS selector that matches `node`.
*/
function getSelector(node)
{
	const selector = [];

	while (node.tagName !== "root")
	{
		let name = node.tagName;

		// Only one of these are ever allowed -- so, index is unnecessary
		if (name!=="html" && name!=="body" & name!=="head")
		{
			name += `:nth-child(${getNthIndex(node)})`;
		}

		// Building backwards
		selector.push(name);

		node = node.parentNode;
	}

	return selector.reverse().join(" > ");
}



function getText(node)
{
	let text = null;

	if (node.childNodes.length > 0)
	{
		text = "";

		walk(node, node =>
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
	Scrape a parsed HTML document/tree for links.
*/
function scrapeHtml(document, pageUrl, robots)
{
	const links = [];
	const rootNode = findRootNode(document);
	const {base} = findPreliminaries(rootNode, robots);

	findLinks(rootNode, (node, attrName, url) =>
	{
		const link = Link.create();

		link.html.attrs = node.attribs;
		link.html.attrName = attrName;
		link.html.base = base;
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

		Link.resolve(link, url, pageUrl);

		links.push(link);
	});

	return links;
}

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

/*
	Serialize an HTML node back to a string.
*/
function stringifyNode(node)
{
	const attrs = Object.keys(node.attribs).reduce((result, attrName) => `${result} ${attrName}="${node.attribs[attrName]}"`, "");

	return `<${node.tagName}${attrs}>`;
}



module.exports = scrapeHtml;
