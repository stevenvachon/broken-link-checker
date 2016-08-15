import {BLC_INVALID} from "./reasons";
//import {isCompatibleScheme as isFileScheme, streamHTML as streamHTMLFromFile} from "./file-protocol";
import {/*isCompatibleScheme as isHTTPScheme, */streamHTML as streamHTMLFromHTTP} from "./http-protocol";
import isURL from "isurl";



/**
 * Retreive HTML contents from a URL.
 * @param {URL} url
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {ExpectedHTMLError} if not HTML media type
 * @throws {HTMLRetrievalError} 404, etc
 * @throws {TypeError} non-URL
 * @returns {Promise<object>}
 */
export default async (url, auth, cache, options) =>
{
	if (!isURL(url))
	{
		throw new TypeError(BLC_INVALID);
	}
	else
	{
		/*if (isFileScheme(url))
		{
			const stream = await streamHTMLFromFile(url);
			return {stream};
		}
		else if (isHTTPScheme(url))
		{*/
			return streamHTMLFromHTTP(url, auth, cache, options);
		//}
	}
};
