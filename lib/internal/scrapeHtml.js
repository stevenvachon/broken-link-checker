import * as Link from "./Link";
import condenseWhitespace from "condense-whitespace";
import list2Array from "list-to-array";
import parseMetaRefresh from "http-equiv-refresh";
import parseSrcset from "parse-srcset";
import RobotDirectives from "robot-directives";
import tags from "./tags";
import walk from "walk-parse5";



const maxFilterLevel = tags[tags.length - 1];



/*
	Traverses the root node to locate links that match filters.
*/
const findLinks = (rootNode, callback) =>
{
	const allNodeAttrs = maxFilterLevel["*"];

	walk(rootNode, node =>
	{
		if (node.nodeName!=="#comment" && node.nodeName!=="#text")
		{
			const filteredNodeAttrs = maxFilterLevel[node.nodeName] ?? {};

			node.attrs.forEach(attr =>
			{
				let url = null;

				// If a supported attribute
				if (filteredNodeAttrs[attr.name] || allNodeAttrs[attr.name])
				{
					switch (attr.name)
					{
						case "content":
						{
							// Special case for `<meta http-equiv="refresh" content="5; url=redirect.html">`
							if (node.attrMap["http-equiv"]?.toLowerCase() === "refresh")
							{
								url = parseMetaRefresh( node.attrMap[attr.name] ).url;
							}

							break;
						}
						case "ping":
						{
							url = list2Array( node.attrMap[attr.name], "," );
							break;
						}
						case "srcset":
						{
							url = parseSrcset( node.attrMap[attr.name] ).map(image => image.url);
							break;
						}
						default:
						{
							// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
							url = node.attrMap[attr.name].trim();
						}
					}

					if (Array.isArray(url))
					{
						url.forEach(_url => callback(node, attr.name, _url));
					}
					else if (url != null)
					{
						callback(node, attr.name, url);
					}
				}
			});
		}
	});
};



/*
	Traverses the root node to locate preliminary elements/data.

	<base href/>

		Looks for the first instance. If no `href` attribute exists,
		the element is ignored and possible successors are considered.

	<meta name content/>

		Looks for all robot instances and cascades the values.
*/
const findPreliminaries = (rootNode, robots) =>
{
	const result = { base:null };

	walk(rootNode, ({attrMap, nodeName}) =>
	{
		switch (nodeName)
		{
			// `<base>` can be anywhere, not just within `<head>`
			case "base":
			{
				if (result.base==null && attrMap.href!=null)
				{
					// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
					result.base = attrMap.href.trim();
				}

				break;
			}
			// `<meta>` can be anywhere
			case "meta":
			{
				if (robots && attrMap.name!=null && attrMap.content!=null)
				{
					const name = attrMap.name.trim().toLowerCase();

					if (name==="robots" || RobotDirectives.isBot(name))
					{
						robots.meta(name, attrMap.content);
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
};



/*
	Find the `<html>` element.
*/
const findRootNode = document => document.childNodes.find(childNode =>
{
	// Doctypes have no `childNodes` property
	// HTML can only have one true root node
	if (childNode.childNodes != null)
	{
		return childNode;
	}
});



/*
	Find a node's `:nth-child()` index among its siblings.
*/
const getNthIndex = node =>
{
	const parentsChildren = node.parentNode.childNodes;
	let count = 0;

	parentsChildren.every(child =>
	{
		if (child !== node)
		{
			// Exclude text and comments nodes
			if (child.nodeName[0] !== "#")
			{
				count++;
			}

			return true;
		}
		else
		{
			return false;
		}
	});

	// `:nth-child()` indices don't start at 0
	return count + 1;
};



/*
	Builds a CSS selector that matches `node`.
*/
const getSelector = node =>
{
	const selector = [];

	while (node.nodeName !== "#document")
	{
		let name = node.nodeName;

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
};



const getText = node =>
{
	let text = null;

	if (node.childNodes.length > 0)
	{
		text = "";

		walk(node, node =>
		{
			if (node.nodeName === "#text")
			{
				text += node.value;
			}
		});

		// TODO :: don't normalize if within <pre> ? use "normalize-html-whitespace" package if so
		text = condenseWhitespace(text);
	}

	return text;
};



/*
	Serialize an HTML node back to a string.
*/
const stringifyNode = node =>
{
	const attrs = node.attrs.reduce((result, attr) => `${result} ${attr.name}="${attr.value}"`, "");

	return `<${node.nodeName}${attrs}>`;
};



/*
	Scrape a parsed HTML document/tree for links.
*/
export default (document, pageUrl, robots) =>
{
	const links = [];
	const rootNode = findRootNode(document);
	const {base} = findPreliminaries(rootNode, robots);

	findLinks(rootNode, (node, attrName, url) =>
	{
		const link = Link.create();

		link.html.attrs = node.attrMap;
		link.html.attrName = attrName;
		link.html.base = base;
		link.html.index = links.length;
		link.html.selector = getSelector(node);
		link.html.tag = stringifyNode(node);
		link.html.tagName = node.nodeName;
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
};
