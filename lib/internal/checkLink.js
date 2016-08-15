import * as Link from "./Link";
import {cloneDeep} from "lodash";
//import {join as joinPath} from "path";
//import {promises as fs} from "fs";
import requestHttp from "./requestHttp";
import URLRelation from "url-relation";

//const {stat:statFile} = fs;



/*const checkFile = async (link, cache, options) =>
{
	try
	{
		const {isFile} = await statFile(link.url.rebased.pathname);

		if (!isFile())
		{
			//throw new Error("ERRNOTFOUND");
		}

		link.broken = false;
	}
	catch ({code})
	{
		Link.setBroken(link, `ERRNO${code}`);
	}
	finally
	{
		return link;
	}
};*/



const checkHttp = async (link, auth, cache, options) =>
{
	const result = await requestHttp(link.url.rebased, auth, options.requestMethod, cache, options)
	.then(({response}) => response)  // exclude any stream
	.catch(error => error);

	copyResponseData(result, link, options);

	link.http.cached = false;

	return link;
};



/*
	Copy data from a `simpleResponse` object—either from a request or cache—
	into a link object.
*/
const copyResponseData = (response, link, options) =>
{
	if (!(response instanceof Error))
	{
		if (response.status<200 || response.status>299)
		{
			Link.setBroken(link, `HTTP_${response.status}`);
		}
		else
		{
			link.broken = false;
		}

		if (options.cacheResponses)
		{
			// Avoid mutations to cache
			link.http.response = cloneDeep(response);
		}
		else
		{
			link.http.response = response;
		}

		// TODO :: would a string check be sufficient?
		if (!URLRelation.match(response.url, link.url.rebased, { targetComponent:URLRelation.PATH }))
		{
			// TODO :: this needs a test
			// TODO :: test if redirected to a different protocol
			Link.redirect(link, response.url);
		}
	}
	else
	{
		Link.setBroken(link, `ERRNO_${response.code}`);
	}
};



/*
	Checks a URL to see if it's broken or not.
*/
export default async (link, auth, cache, options) =>
{
	if (!Link.isLink(link))
	{
		throw new TypeError("Invalid Link");
	}
	else
	{
		let output;

		// TODO :: move out to a `Link.invalidate()` to share with `HtmlChecker()` ?
		if (!(link.url.rebased?.protocol in options.acceptedSchemes))
		{
			Link.setBroken(link, "BLC_INVALID");
			output = link;
		}
		else if (options.cacheResponses)
		{
			// TODO :: different auths can have different responses
			const result = cache.get(link.url.rebased);

			if (result !== undefined)
			{
				copyResponseData(await result, link, options);

				link.http.cached = true;
				output = link;
			}
		}

		if (output)
		{
			return output;
		}
		else
		{
			/*switch (link.url.rebased.protocol)
			{
				"file:":  return checkFile(link, cache, options);

				"http:":
				"https:":*/ return checkHttp(link, auth, cache, options);
			//}
		}
	}
};
