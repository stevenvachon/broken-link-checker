import {HTTPError, stream as streamHTTP} from "got";
//import isPromise from "is-promise";
import isURL from "isurl";
import {reasons} from "./messages";
import tunnel from "auto-tunnel";



const {BLC_INVALID} = reasons;
const GET = "get";
const HEAD = "head";



const authString = (url, auth) =>
{
	if (url.username!=="" || url.password!=="")
	{
		return `${url.username}:${url.password}`;
	}
	else if (auth.password!=="" || auth.username!=="")
	{
		return `${auth.username}:${auth.password}`;
	}
};



const cacheResponse = (response, cache) =>
{
	// TODO :: is this check necessary?
	if (!cache.has(response.url))
	{
		cache.set(response.url, response);
	}
};



const requestUrl = (url, auth, method, options, retry=false) => new Promise((resolve, reject) =>
{
	const headers = { "user-agent":options.userAgent };
	const redirects = [];

	streamHTTP(url,
	{
		agent: tunnel(url, { proxyHeaders:headers }),
		auth: authString(url, auth),
		headers,
		method,
		rejectUnauthorized: false,  // accept self-signed SSL certificates
		retries: 0
	})
	.on("error", error =>
	{
		if (error.statusCode===405 && method===HEAD && options.retry405Head && !retry)
		{
			// Retry potentially broken server with GET
			resolve( requestUrl(url, auth, GET, options, true) );
		}
		else if (error instanceof HTTPError)
		{
			resolve(
			{
				response: simplifyResponse(error, redirects)
			});
		}
		else
		{
			reject(error);
		}
	})
	.on("redirect", stream => redirects.push( simplifyResponse(stream) ))
	.on("response", stream =>
	{
		const response = simplifyResponse(stream, redirects);

		switch (method)
		{
			case GET:
			{
				resolve({ response, stream });
				break;
			}
			case HEAD:
			{
				resolve({ response });
				break;
			}
		}
	});
});



// TODO :: use fetch's `Response` ?
// TODO :: add response time
const simplifyResponse = ({headers, statusCode, statusMessage, url}, redirects) =>
({
	headers,
	status: statusCode,
	statusText: statusMessage,
	url: new URL(url),
	...(redirects && {redirects})
});



// TODO :: use `Promise.try()` instead of `async` ?
export default async (url, auth, method, cache, options) =>
{
	if (!isURL.lenient(url))
	{
		throw new TypeError(BLC_INVALID);
	}
	else
	{
		const promise = requestUrl(url, auth, method.toLowerCase(), options);

		if (options.cacheResponses)
		{
			const cachedPromise = promise
			.then(({response}) =>
			{
				// Any final redirect
				cacheResponse(response, cache);

				// Any intermediary redirects
				response.redirects.forEach(redirect => cacheResponse(redirect, cache));

				return response;
			})
			.catch(error => error)  // pass-through
			/*.finally(result =>
			{
				// TODO :: replace cached promise?
				if (isPromise(cache.get(url)))
				{
					cache.set(url, result);
				}

				return result;  // for anything chained to `cachedPromise`
			})*/;

			// Make future response available to other requests before completion
			// Will always overwrite previous value
			cache.set(url, cachedPromise);
		}

		return promise;
	}
};
