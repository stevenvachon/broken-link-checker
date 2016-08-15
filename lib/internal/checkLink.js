import {cloneDeep} from "lodash";
//import {join as joinPath} from "path";
import Link, {HTTP_RESPONSE, HTTP_RESPONSE_WAS_CACHED, REBASED_URL} from "./Link";
//import {promises as fs} from "fs";
import requestHTTP from "./requestHTTP";
import URLRelation from "url-relation";

//const {stat:statFile} = fs;



/**
 * Check a link on the local file system.
 * @param {Link} link
 * @param {URLCache} cache
 * @param {object} options
 * @returns {Promise<Link>}
 */
/*const checkFile = async (link, cache, options) =>
{
	try
	{
		const {isFile} = await statFile(link.get(REBASED_URL).pathname);

		if (!isFile())
		{
			//throw new Error("ERRNOTFOUND");
		}

		link.mend();
	}
	catch ({code})
	{
		link.break(`ERRNO_${code}`);
	}
	finally
	{
		return link;
	}
};*/



/**
 * Check a link via HTTP.
 * @param {Link} link
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @returns {Promise<Link>}
 */
const checkHTTP = async (link, auth, cache, options) =>
{
	const result = await requestHTTP(link.get(REBASED_URL), auth, options.requestMethod, cache, options)
	.then(({response}) => response)  // exclude any stream
	.catch(error => error);

	copyResponseData(result, link, options);

	link.set(HTTP_RESPONSE_WAS_CACHED, false);

	return link;
};



/**
 * Copy data from a cached or uncached response into a Link.
 * @param {object|Error} response
 * @param {Link} link
 * @param {object} options
 */
const copyResponseData = (response, link, {cacheResponses}) =>
{
	if (response instanceof Error)
	{
		link.break(`ERRNO_${response.code}`);
	}
	else
	{
		if (response.status<200 || response.status>299)
		{
			link.break(`HTTP_${response.status}`);
		}
		else
		{
			link.mend();
		}

		// @todo would a string check be sufficient?
		if (!URLRelation.match(response.url, link.get(REBASED_URL), { targetComponent:URLRelation.PATH }))
		{
			// @todo this needs a test
			// @todo test if redirected to a different protocol
			link.redirect(response.url);
		}

		if (cacheResponses)
		{
			// Avoid potential mutations to cache
			response = cloneDeep(response);
		}

		link.set(HTTP_RESPONSE, response);
	}
};



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
		let output;

		// @todo move out to a `Link::invalidate()` to share with `HtmlChecker()` ?
		if (!(link.get(REBASED_URL)?.protocol in options.acceptedSchemes))
		{
			link.break("BLC_INVALID");
			output = link;
		}
		else if (options.cacheResponses)
		{
			// @todo different auths can have different responses
			const result = cache.get(link.get(REBASED_URL));

			if (result !== undefined)
			{
				copyResponseData(await result, link, options);

				link.set(HTTP_RESPONSE_WAS_CACHED, true);
				output = link;
			}
		}

		if (output)
		{
			return output;
		}
		else
		{
			/*switch (link.get(REBASED_URL).protocol)
			{
				"file:":  return checkFile(link, cache, options);

				"http:":
				"https:":*/ return checkHTTP(link, auth, cache, options);
			//}
		}
	}
};
