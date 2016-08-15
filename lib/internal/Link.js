import * as reasons from "./reasons";
import isURL from "isurl";
import URLRelation from "url-relation";



export const ORIGINAL_URL = "originalURL";      // The URL string as it was inputted
export const RESOLVED_URL = "resolvedURL";      // The `URL`, resolved with `RESOLVED_BASE_URL`
export const REBASED_URL = "rebasedURL";        // The `URL`, resolved with `REBASED_BASE_URL`
export const REDIRECTED_URL = "redirectedURL";  // The `URL`, after its last redirection, if any

export const RESOLVED_BASE_URL = "resolvedBaseURL";  // The base `URL`
export const REBASED_BASE_URL = "rebasedBaseURL";    // The base `URL`, resolved with `HTML_BASE_HREF`

export const HTML_INDEX = "htmlIndex";               // The order in which the link appeared in its document -- using max-level tag filter
export const HTML_OFFSET_INDEX = "htmlOffsetIndex";  // Sequential (gap-free) indices for skipped and unskipped links
export const HTML_LOCATION = "htmlLocation";         // Source code location of the attribute that the link was found within
export const HTML_SELECTOR = "htmlSelector";         // CSS selector for element in document
export const HTML_TAG_NAME = "htmlTagName";          // Tag name that the link was found on
export const HTML_ATTR_NAME = "htmlAttrName";        // Attribute name that the link was found within
export const HTML_ATTRS = "htmlAttrs";               // All attributes on the element
export const HTML_TEXT = "htmlText";                 // TextNodes/innerText of the element
export const HTML_TAG = "htmlTag";                   // The entire tag string
export const HTML_BASE_HREF = "htmlBaseHref";        // The document's `<base href>` value

export const HTTP_RESPONSE = "httpResponse";                      // The request response
export const HTTP_RESPONSE_WAS_CACHED = "httpResponseWasCached";  // If the response was from cache

export const IS_BROKEN = "isBroken";        // If the link was determined to be broken or not
export const IS_INTERNAL = "isInternal";          // If the link is to the same host as its base/document
export const IS_SAME_PAGE = "isSamePage";   // If the link is to the same page as its base/document
export const WAS_EXCLUDED = "wasExcluded";  // If the link was excluded due to any filtering

export const BROKEN_REASON = "brokenReason";      // The reason why the link was considered broken, if it indeed is
export const EXCLUDED_REASON = "excludedReason";  // The reason why the link was excluded from being checked, if it indeed was



export default class Link extends Map
{
	/**
	 * @param {Link} [link]
	 */
	constructor(link)
	{
		super(link);

		if (!(link instanceof Link))
		{
			// Default values
			keysAsList.forEach(key => super.set(key, null));
		}
	}


	/**
	 * Change state to "broken" with a reason.
	 * @param {string} reasonKey
	 * @returns {Link}
	 */
	break(reasonKey)
	{
		if (!(reasonKey in reasons))
		{
			reasonKey = "BLC_UNKNOWN";
		}

		super.set(IS_BROKEN, true);
		super.set(BROKEN_REASON, reasonKey);
		return this;
	}



	/**
	 * Change state to "excluded" with a reason.
	 * @param {string} reasonKey
	 * @returns {Link}
	 */
	exclude(reasonKey)
	{
		super.set(WAS_EXCLUDED, true);
		super.set(EXCLUDED_REASON, reasonKey);
		return this;
	}



	/**
	 * Change state to "not excluded" and remove any previous reason for being otherwise.
	 * @returns {Link}
	 */
	include()
	{
		super.set(WAS_EXCLUDED, false);
		super.set(EXCLUDED_REASON, null);
		return this;
	}



	/**
	 * Change state to "not broken" and remove any previous reason for being otherwise.
	 * @returns {Link}
	 */
	mend()
	{
		super.set(IS_BROKEN, false);
		super.set(BROKEN_REASON, null);
		return this;
	}


	/**
	 * Assign a redirected URL and change any relative state.
	 * @param {URL|string} url
	 * @returns {Link}
	 */
	redirect(url)
	{
		super.set(REDIRECTED_URL, parseURL(url));

		this.#relateWithBase();
		return this;
	}



	/**
	 * Reassign properties associated with state relative to the link's environment.
	 */
	#relateWithBase()
	{
		const url = super.get(REDIRECTED_URL) ?? super.get(REBASED_URL);

		// If impossible to determine is linked to same server/etc
		if (url===null || super.get(RESOLVED_BASE_URL)===null)
		{
			// Overwrite any previous values
			super.set(IS_INTERNAL, null);
			super.set(IS_SAME_PAGE, null);
		}
		else
		{
			// Rebased base URL not used because `<base href>` URL could be remote
			// @todo common/careful profile
			// @todo auth shouldn't affect this
			const relation = new URLRelation(url, super.get(RESOLVED_BASE_URL));

			super.set(IS_INTERNAL,     relation.upTo(URLRelation.HOST));
			super.set(IS_SAME_PAGE, relation.upTo(URLRelation.PATH));
		}
	}



	/**
	 * Produce and assign an absolute URL and change any relative state.
	 * @param {URL|string} url
	 * @param {URL|string} base
	 * @returns {Link}
	 */
	resolve(url, base)
	{
		if (url != null)
		{
			// Parse or clone
			base = parseURL(base);

			if (isURL.lenient(url))
			{
				super.set(ORIGINAL_URL, url.href);
				super.set(RESOLVED_URL, url);
			}
			else
			{
				super.set(ORIGINAL_URL, url);
				super.set(RESOLVED_URL, parseURL(url));
			}

			if (base !== null)
			{
				// Remove any hash since it's useless in a base -- safe to mutate
				base.hash = "";

				const rebased = parseURL(super.get(HTML_BASE_HREF), base);

				super.set(REBASED_BASE_URL, rebased ?? base);
				super.set(RESOLVED_BASE_URL, base);
			}
			else
			{
				super.set(REBASED_BASE_URL, parseURL(super.get(HTML_BASE_HREF)));
			}

			if (super.get(REBASED_BASE_URL) !== null)
			{
				// Remove any hash since it's useless in a base -- safe to mutate
				super.get(REBASED_BASE_URL).hash = "";

				if (super.get(RESOLVED_URL) === null)
				{
					super.set(RESOLVED_URL, parseURL(url, super.get(RESOLVED_BASE_URL)));
					super.set(REBASED_URL,  parseURL(url, super.get(REBASED_BASE_URL)));
				}
				else
				{
					super.set(REBASED_URL, super.get(RESOLVED_URL));
				}
			}
			else
			{
				super.set(REBASED_URL, super.get(RESOLVED_URL));
			}

			// @todo move relation stuff out of this function -- separation of concerns?
			this.#relateWithBase();
		}

		return this;
	}



	/**
	 * Assign a value to a supported key.
	 * @param {symbol} key
	 * @param {*} value
	 * @throws {TypeError} unsupported key or undefined value
	 * @returns {Link}
	 */
	set(key, value)
	{
		if (!(key in keysAsKeys))
		{
			throw new TypeError("Invalid key");
		}
		else if (value === undefined)
		{
			throw new TypeError("Invalid value");
		}
		else
		{
			return super.set(key, value);
		}
	}



	/**
	 * Produce a key-value object for `JSON.stringify()`.
	 * @returns {object}
	 */
	toJSON()
	{
		// @todo https://github.com/tc39/proposal-pipeline-operator
		return Object.fromEntries(Array.from(super.entries()));
	}
}



const keysAsValues =
{
	BROKEN_REASON,
	EXCLUDED_REASON,
	HTML_ATTR_NAME,
	HTML_ATTRS,
	HTML_BASE_HREF,
	HTML_INDEX,
	HTML_LOCATION,
	HTML_OFFSET_INDEX,
	HTML_SELECTOR,
	HTML_TAG,
	HTML_TAG_NAME,
	HTML_TEXT,
	HTTP_RESPONSE,
	HTTP_RESPONSE_WAS_CACHED,
	IS_BROKEN,
	IS_INTERNAL,
	IS_SAME_PAGE,
	ORIGINAL_URL,
	REBASED_BASE_URL,
	REBASED_URL,
	REDIRECTED_URL,
	RESOLVED_BASE_URL,
	RESOLVED_URL,
	WAS_EXCLUDED
};



const keysAsList = Object.values(keysAsValues);



const keysAsKeys = keysAsList.reduce((result, value) =>
{
	result[value] = true;  // memoized value
	return result;
}, {});



/**
 * Parse or clone a URL.
 * @param {URL|string|null} [url]
 * @param {URL|string} [base]
 * @returns {URL|null}
 */
const parseURL = (url=null, base) =>
{
	if (url !== null)
	{
		try
		{
			url = new URL(url, base);
		}
		catch
		{
			url = null;
		}
	}

	return url;
};



Object.freeze(Link);
