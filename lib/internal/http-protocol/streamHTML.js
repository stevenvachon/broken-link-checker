import {ExpectedHTMLMediaTypeError} from "./errors";
import {GET} from "http-methods-constants";
import {HTMLRetrievalError} from "../errors";
import request from "./request";



const CONTENT_TYPE = "content-type";
const HTML_MIMETYPE = "text/html";
const XHTML_MIMETYPE = "application/xhtml+xml";



/**
 * Request a URL for its HTML contents.
 * @param {URL} url
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {ExpectedHTMLMediaTypeError} if not HTML media type
 * @throws {HTMLRetrievalError} 404, etc
 * @throws {Error} if failed connection
 * @returns {Promise<object>}
 */
export default async (url, auth, cache, options) =>
{
	const result = await request(url, auth, GET, cache, options);
	const {response: {headers, status}} = result;

	if (status<200 || status>299)
	{
		throw new HTMLRetrievalError(status);
	}
	else
	{
		const type = headers[CONTENT_TYPE];

		// Content-type is not mandatory in HTTP spec
		// Could have trailing charset
		if (!type?.startsWith(HTML_MIMETYPE) && !type?.startsWith(XHTML_MIMETYPE))
		{
			throw new ExpectedHTMLMediaTypeError(type, status);
		}
	}

	return result;
};
