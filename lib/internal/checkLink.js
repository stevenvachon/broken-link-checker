"use strict";
const Link       = require("./Link");
const {reasons}  = require("./messages");
const requestUrl = require("./requestUrl");

const extend = require("extend");
//const isPromise = require("is-promise");
//const {join:joinPath} = require("path");
const promiseTry = require("es6-promise-try");
//const statFile = require("util.promisify")( require("fs").stat );
const URLRelation = require("url-relation");




/*function checkFile(link, cache, options)
{
	return statFile(link.url.rebased.pathname).then(stats =>
	{
		if (!stats.isFile())
		{
			//throw new Error("ERRNOTFOUND");
		}

		link.broken = false;
	})
	.catch(error =>
	{
		link.broken = true;
		link.brokenReason = reasons[`ERRNO${error.code}`];
	});
}*/



function checkHttp(link, auth, cache, options)
{
	const request = requestUrl(link.url.rebased, auth, options.requestMethod, options).then(({response}) =>
	{
		if (options.cacheResponses)
		{
			/*if (isPromise(cache.get(link.url.rebased)))
			{
				// Exclude the stream from cache
				cache.set(link.url.rebased, response);
			}*/

			// TODO :: move cache logic to `redirectUrl` for use in `streamHtml`

			if (!cache.has(response.url))
			{
				cache.set(response.url, response);
			}

			// TODO :: this needs a test
			response.redirects.forEach(redirect =>
			{
				if (!cache.has(redirect.url))
				{
					cache.set(redirect.url, redirect);
				}
			});
		}

		return response;
	})
	.catch(error => error);  // will be stored as a response

	if (options.cacheResponses)
	{
		// Make future response available to `cache.get()` before completion
		cache.set(link.url.rebased, request);
	}

	// Send link to caller
	return request.then(response =>
	{
		copyResponseData(response, link, options);

		link.http.cached = false;

		return link;
	});
}



/*
	Checks a URL to see if it's broken or not.
*/
function checkLink(link, auth, cache, options)
{
	return promiseTry(() =>
	{
		// TODO :: move out to a `Link.invalidate()` to share with `HtmlChecker()` ?
		if (link.url.rebased===null || options.acceptedSchemes[link.url.rebased.protocol]!==true)
		{
			link.broken = true;
			link.brokenReason = "BLC_INVALID";
			return link;
		}
		else if (options.cacheResponses)
		{
			// TODO :: different auths can have different responses
			const cached = cache.get(link.url.rebased);

			if (cached !== undefined)
			{
				return Promise.resolve(cached).then(response =>
				{
					copyResponseData(response, link, options);

					link.http.cached = true;

					return link;
				});
			}
		}

		/*switch (link.url.rebased.protocol)
		{
			"file:":  return checkFile(link, cache, options);

			"http:":
			"https:":*/ return checkHttp(link, auth, cache, options);
		//}
	});
}



/*
	Copy data from a `simpleResponse` object—either from a request or cache—
	into a link object.
*/
function copyResponseData(response, link, options)
{
	if (!(response instanceof Error))
	{
		if (response.status<200 || response.status>299)
		{
			link.broken = true;

			if (`HTTP_${response.status}` in reasons)
			{
				link.brokenReason = `HTTP_${response.status}`;
			}
		}
		else
		{
			link.broken = false;
		}

		if (options.cacheResponses)
		{
			// Deep-cloned to avoid mutations to cache
			link.http.response = extend(true, {}, response);
		}
		else
		{
			link.http.response = response;
		}

		// TODO :: would a string check be sufficient?
		if (URLRelation(response.url, link.url.rebased) < URLRelation.PATH)
		{
			// TODO :: this needs a test
			// TODO :: test if redirected to a different protocol
			Link.redirect(link, response.url);
		}
	}
	else
	{
		link.broken = true;

		if (`ERRNO_${response.code}` in reasons)
		{
			link.brokenReason = `ERRNO_${response.code}`;
		}
	}

	if (link.broken && link.brokenReason==null)
	{
		link.brokenReason = "BLC_UNKNOWN";
	}
}



module.exports = checkLink;
