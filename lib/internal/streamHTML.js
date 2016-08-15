import {ExpectedHTMLError, HTMLRetrievalError} from "./errors";
import {GET_METHOD} from "./methods";
import requestHTTP from "./requestHTTP";



const CONTENT_TYPE = "content-type";
const HTML_MIMETYPE = "text/html";



/**
 * Request a URL for its HTML contents.
 * @param {URL} url
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {ExpectedHTMLError} if not HTML mimetype
 * @throws {HTMLRetrievalError} 404, etc
 * @returns {Promise<Stream>}
 */
export default async (url, auth, cache, options) =>
{
	const result = await requestHTTP(url, auth, GET_METHOD, cache, options);
	const {response: {headers, status}} = result;

	if (status<200 || status>299)
	{
		throw new HTMLRetrievalError(status);
	}
	else
	{
		const type = headers[CONTENT_TYPE];

		// Content-type is not mandatory in HTTP spec
		if (!type?.startsWith(HTML_MIMETYPE))
		{
			throw new ExpectedHTMLError(type, status);
		}
	}

	return result;
};
