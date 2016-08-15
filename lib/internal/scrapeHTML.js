import condenseWhitespace from "condense-whitespace";
import Link, {HTML_ATTR_NAME, HTML_ATTRS, HTML_BASE_HREF, HTML_INDEX, HTML_LOCATION, HTML_SELECTOR, HTML_TAG, HTML_TAG_NAME, HTML_TEXT} from "./Link";
import parseMetaRefresh from "http-equiv-refresh";
import parseSrcset from "parse-srcset";
import RobotDirectives from "robot-directives";
import TAGS from "./tags";
import walk from "walk-parse5";



const MAX_FILTER_LEVEL = TAGS[TAGS.length - 1];
const ALL_NODE_ATTRS = MAX_FILTER_LEVEL["*"];

const SPECIAL_NODE_NAME_PREFIX = "#";

const BASE_NODE_NAME = "base";
const BODY_NODE_NAME = "body";
const COMMENT_NODE_NAME = `${SPECIAL_NODE_NAME_PREFIX}comment`;
const DOCUMENT_NODE_NAME = `${SPECIAL_NODE_NAME_PREFIX}document`;
const HEAD_NODE_NAME = "head";
const HTML_NODE_NAME = "html";
const META_NODE_NAME = "meta";
const TEXT_NODE_NAME = `${SPECIAL_NODE_NAME_PREFIX}text`;

const CONTENT_ATTR_NAME = "content";
const HREF_ATTR_NAME = "href";
const HTTP_EQUIV_ATTR_NAME = "http-equiv";
const NAME_ATTR_NAME = "name";
const PING_ATTR_NAME = "ping";
const SRCSET_ATTR_NAME = "srcset";

const REFRESH_ATTR_VALUE = "refresh";
const ROBOTS_ATTR_VALUE = "robots";



/**
 * Traverse the root node (synchronously) and return located links via a callback function.
 * @param {object} rootNode
 * @param {Function} callback
 */
const findLinks = (rootNode, callback) =>
{
	walk(rootNode, node =>
	{
		if (node.nodeName!==COMMENT_NODE_NAME && node.nodeName!==TEXT_NODE_NAME)
		{
			const filteredNodeAttrs = MAX_FILTER_LEVEL[node.nodeName] ?? {};

			node.attrs.forEach(({name:attrName, value:attrValue}) =>
			{
				let url = null;

				// If a supported attribute
				if (attrName in filteredNodeAttrs || attrName in ALL_NODE_ATTRS)
				{
					switch (attrName)
					{
						case CONTENT_ATTR_NAME:
						{
							// Special case for `<meta http-equiv="refresh" content>`
							// No browser supports a value surrounded by spaces, so `trim()` is not used
							if (node.attrMap[HTTP_EQUIV_ATTR_NAME]?.toLowerCase() === REFRESH_ATTR_VALUE)
							{
								url = parseMetaRefresh(attrValue).url;
							}

							break;
						}
						case PING_ATTR_NAME:
						{
							url = attrValue.split(" ").filter(pingURL => pingURL !== "");
							break;
						}
						case SRCSET_ATTR_NAME:
						{
							url = parseSrcset(attrValue).map(image => image.url);
							break;
						}
						default:
						{
							// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
							url = attrValue.trim();
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
};



/**
 * Traverse the root node to locate preliminary elements/data.
 *
 * <base href>
 *
 * 	Looks for the first instance. If no `href` attribute exists,
 * 	the element is ignored and possible successors are considered.
 *
 * <meta name content>
 *
 * 	Looks for all robot instances and cascades the values.
 *
 * @param {object} rootNode
 * @param {RobotDirectives} robots
 * @returns {object}
 */
const findPreliminaries = (rootNode, robots) =>
{
	const result = { base:null };

	walk(rootNode, ({attrMap, nodeName}) =>
	{
		switch (nodeName)
		{
			// `<base>` can be anywhere, not just within `<head>`
			case BASE_NODE_NAME:
			{
				if (result.base===null && HREF_ATTR_NAME in attrMap)
				{
					// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
					result.base = attrMap[HREF_ATTR_NAME].trim();
				}

				break;
			}
			// `<meta>` can be anywhere
			case META_NODE_NAME:
			{
				if (robots && NAME_ATTR_NAME in attrMap && CONTENT_ATTR_NAME in attrMap)
				{
					const name = attrMap[NAME_ATTR_NAME].trim().toLowerCase();

					if (name===ROBOTS_ATTR_VALUE || RobotDirectives.isBot(name))
					{
						robots.meta(name, attrMap[CONTENT_ATTR_NAME]);
					}
				}

				break;
			}
		}

		if (result.base!==null && !robots)
		{
			// Kill walk
			return false;
		}
	});

	return result;
};



/**
 * Find the `<html>` element.
 * @param {object} document
 * @returns {object}
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



/**
 * Find a node's `:nth-child()` index among its siblings.
 * @param {object} node
 * @returns {number}
 */
const getNthIndex = node =>
{
	const parentsChildren = node.parentNode.childNodes;
	let count = 0;

	parentsChildren.every(child =>
	{
		if (child !== node)
		{
			// Exclude non-element nodes
			if (!child.nodeName.startsWith(SPECIAL_NODE_NAME_PREFIX))
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



/**
 * Produces a CSS selector that matches an element.
 * @param {object} node
 * @returns {string}
 */
const getSelector = node =>
{
	const selector = [];

	while (node.nodeName !== DOCUMENT_NODE_NAME)
	{
		let name = node.nodeName;

		// Only one of these are ever allowed per document -- so, index is unnecessary
		if (name!==HTML_NODE_NAME && name!==BODY_NODE_NAME & name!==HEAD_NODE_NAME)
		{
			name += `:nth-child(${getNthIndex(node)})`;
		}

		// Building backwards
		selector.push(name);

		node = node.parentNode;
	}

	return selector.reverse().join(" > ");
};



/**
 * Produces an `innerText` value for text nodes within an element.
 * @param {object} node
 * @returns {string|null}
 */
const getText = node =>
{
	let text = null;

	if (node.childNodes.length > 0)
	{
		text = "";

		walk(node, ({nodeName, value}) =>
		{
			if (nodeName === TEXT_NODE_NAME)
			{
				text += value;
			}
		});

		// @todo don't normalize if within <pre> ? use "normalize-html-whitespace" package if so
		text = condenseWhitespace(text);
	}

	return text;
};



/**
 * Serialize an HTML element into a string.
 * @param {object} node
 * @returns {string}
 */
const stringifyNode = ({attrs, nodeName}) =>
{
	const attrsString = attrs.reduce((result, {name, value}) => `${result} ${name}="${value}"`, "");

	return `<${nodeName}${attrsString}>`;
};



/**
 * Scrape a parsed HTML document/tree for links.
 * @param {object} document
 * @param {URL|string} pageURL
 * @param {RobotDirectives} robots
 * @returns {Array<Link>}
 */
export default (document, pageURL, robots) =>
{
	const links = [];
	const rootNode = findRootNode(document);
	const {base} = findPreliminaries(rootNode, robots);

	findLinks(rootNode, (node, attrName, url) =>
	{
		// Elements added for compliance (not from HTML source) have no location
		const location = node.sourceCodeLocation?.attrs[attrName] ?? null;

		const link = new Link()
		.set(HTML_ATTR_NAME, attrName)
		.set(HTML_ATTRS, node.attrMap)
		.set(HTML_BASE_HREF, base)
		.set(HTML_INDEX, links.length)
		.set(HTML_LOCATION, location)
		.set(HTML_SELECTOR, getSelector(node))
		.set(HTML_TAG, stringifyNode(node))
		.set(HTML_TAG_NAME, node.nodeName)
		.set(HTML_TEXT, getText(node))
		.resolve(url, pageURL);

		links.push(link);
	});

	return links;
};
