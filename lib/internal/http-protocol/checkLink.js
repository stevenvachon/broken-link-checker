import {cloneDeep} from "lodash";
import {HTTP_RESPONSE, HTTP_RESPONSE_WAS_CACHED, REBASED_URL} from "../Link";
import request from "./request";
import URLRelation from "url-relation";



/**
 * Copy data from a cached or uncached response into a Link.
 * @param {object|Error} response
 * @param {Link} link
 * @param {object} options
 */
const copyResponseData = (response, link, {cacheResponses}) =>
{
	const {code, status, url} = response;

	if (response instanceof Error)
	{
		link.break(`ERRNO_${code}`);
	}
	else
	{
		if (status<200 || status>299)
		{
			link.break(`HTTP_${status}`);
		}
		else
		{
			link.mend();
		}

		// @todo would a string check be sufficient?
		if (!URLRelation.match(url, link.get(REBASED_URL), { targetComponent:URLRelation.PATH }))
		{
			// @todo this needs a test
			// @todo test if redirected to a different protocol
			link.redirect(url);
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
	const {cacheResponses, requestMethod} = options;

	if (cacheResponses)
	{
		const result = cache.get(link.get(REBASED_URL));

		if (result !== undefined)
		{
			copyResponseData(await result, link, options);

			link.set(HTTP_RESPONSE_WAS_CACHED, true);
		}
	}

	if (link.get(HTTP_RESPONSE_WAS_CACHED) === null)
	{
		const result = await request(link.get(REBASED_URL), auth, requestMethod, cache, options)
		.then(({response}) => response)  // exclude any stream
		.catch(error => error);

		copyResponseData(result, link, options);

		link.set(HTTP_RESPONSE_WAS_CACHED, false);
	}

	return link;
};
