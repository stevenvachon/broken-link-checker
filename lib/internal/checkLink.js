import * as reasons from "./reasons";
import {checkLink as checkFileLink, isCompatibleScheme as isFileScheme} from "./file-protocol";
import {checkLink as checkHTTPLink, isCompatibleScheme as isHTTPScheme} from "./http-protocol";
import isString from "is-string";
import Link, {REBASED_URL} from "./Link";
import matchURL from "./matchURL";



/**
 * Check a link's URL to see if it is broken or not.
 * @param {Link} link
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {TypeError} non-Link
 * @returns {Promise<Link>}
 */
export default async (link, auth, cache, options) =>
{
	if (!(link instanceof Link))
	{
		throw new TypeError("Invalid Link");
	}
	else
	{
		const {excludedKeywords, includedKeywords, includeLink} = options;
		const rebasedURL = link.get(REBASED_URL);

		if (rebasedURL === null)
		{
			link.break("BLC_INVALID");
			return link;
		}
		else if (!isFileScheme(rebasedURL) && !isHTTPScheme(rebasedURL))
		{
			link.exclude("BLC_UNSUPPORTED");
			return link;
		}
		else if (matchURL(rebasedURL.href, excludedKeywords))
		{
			link.exclude("BLC_KEYWORD");
			return link;
		}
		else if (includedKeywords.length>0 && !matchURL(rebasedURL.href, includedKeywords))
		{
			link.exclude("BLC_KEYWORD");
			return link;
		}
		else
		{
			const filterResult = includeLink(link);

			// Undocumented support for strings (from `SiteChecker`)
			if (isString(filterResult) && filterResult in reasons)
			{
				link.exclude(filterResult);
				return link;
			}
			else if (!filterResult)
			{
				link.exclude("BLC_CUSTOM");
				return link;
			}
			else
			{
				if (isFileScheme(rebasedURL))
				{
					return checkFileLink(link);
				}
				else if (isHTTPScheme(rebasedURL))
				{
					return checkHTTPLink(link, auth, cache, options);
				}
			}
		}
	}
};
