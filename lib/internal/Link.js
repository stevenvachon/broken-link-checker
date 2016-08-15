import isObject from "is-object";
import isURL from "isurl";
import {reasons} from "./messages";
import URLRelation from "url-relation";



const taggedProperty = { value:true };



export const create = () =>
{
	/* eslint-disable sort-keys */
	const result =
	{
		url:
		{
			original: null,     // The URL string as it was inputted
			resolved: null,     // The `URL`, resolved with `base.resolved`
			rebased: null,      // The `URL`, resolved with `base.rebased`
			redirected: null    // The `URL`, after its last redirection, if any
		},

		base:
		{
			resolved: null,     // The base `URL`
			rebased: null       // The base `URL`, resolved with `html.base`
		},

		html:
		{
			index: null,        // The order in which the link appeared in its document -- using max-level tag filter
			offsetIndex: null,  // Sequential (gap-free) indices for skipped and unskipped links
			location: null,     // Source code location of the attribute that the link was found within
			selector: null,     // CSS selector for element in document
			tagName: null,      // Tag name that the link was found on
			attrName: null,     // Attribute name that the link was found within
			attrs: null,        // All attributes on the element
			text: null,         // TextNode/innerText within the element
			tag: null,          // The entire tag string
			base: null          // The document's `<base href>` value
		},

		http:
		{
			cached: null,       // If the response was pulled from cache
			response: null      // The request response
		},

		broken: null,           // If the link was determined to be broken or not
		internal: null,         // If the link is to the same server as its base/document
		samePage: null,         // If the link is to the same page as its base/document
		excluded: null,         // If the link was excluded due to any filtering

		brokenReason: null,     // The reason why the link was considered broken, if it indeed is
		excludedReason: null    // The reason why the link was excluded from being checked, if it indeed was
	};
	/* eslint-disable sort-keys */

	Object.defineProperty(result, "broken_link_checker", taggedProperty);

	return result;
};



/*
	Determines whether an input is a Link.
*/
export const isLink = input => isObject(input) && input.broken_link_checker===true;



const parseURL = (url=null, base) =>
{
	if (url !== null)
	{
		try
		{
			url = new URL(url, base);
		}
		catch(error)
		{
			url = null;
		}
	}

	return url;
};



/*
	Apply a redirected URL to a link.
*/
export const redirect = (link, url) =>
{
	link.url.redirected = parseURL(url);

	return relation(link);
};



/*
	Define the relationship with the base URL.
*/
const relation = link =>
{
	let url;

	if (link.url.redirected !== null)
	{
		url = link.url.redirected;
	}
	else if (link.url.rebased !== null)
	{
		url = link.url.rebased;
	}

	// If impossible to determine if they link to the same server
	if (url==null || link.base.resolved===null)
	{
		// Overwrite any previous values
		link.internal = null;
		link.samePage = null;
	}
	else
	{
		// Resolved base not used because html base could be remote
		// TODO :: above comment does not make sense
		// TODO :: common/careful profile
		// TODO :: auth shouldn't affect this
		const relation = new URLRelation(url, link.base.resolved);

		link.internal = relation.upTo(URLRelation.HOST);
		link.samePage = relation.upTo(URLRelation.PATH);
	}

	return link;
};



/*
	Create an absolute URL from a link's base URL and HTML `<base>`.

	`link`: must be a `Link`
	`url`:  must be a `URL` or `String`
	`base`: must be a `URL` or `String`
*/
export const resolve = (link, url, base) =>
{
	if (url == null)
	{
		return link;
	}
	else
	{
		// Parse or clone
		base = parseURL(base);

		if (isURL.lenient(url))
		{
			link.url.original = url.href;
			link.url.resolved = url;
		}
		else
		{
			link.url.original = url;
			link.url.resolved = parseURL(url);
		}

		if (base !== null)
		{
			// Remove any hash since it's useless in a base
			base.hash = "";

			const rebased = parseURL(link.html.base, base);

			link.base.rebased = (rebased !== null) ? rebased : base;
			link.base.resolved = base;
		}
		else
		{
			link.base.rebased = parseURL(link.html.base);
		}

		if (link.base.rebased !== null)
		{
			// Remove any hash since it's useless in a base
			link.base.rebased.hash = "";

			if (link.url.resolved === null)
			{
				link.url.resolved = parseURL(url, link.base.resolved);
				link.url.rebased  = parseURL(url, link.base.rebased);
			}
			else
			{
				link.url.rebased = link.url.resolved;
			}
		}
		else
		{
			link.url.rebased = link.url.resolved;
		}

		// TODO :: move relation stuff out of this function -- separation of concerns?
		return relation(link);
	}
};



export const setBroken = (link, reason) =>
{
	link.broken = true;

	if (reason in reasons)
	{
		link.brokenReason = reason;
	}
	else
	{
		link.brokenReason = "BLC_UNKNOWN";
	}

	return link;
};
