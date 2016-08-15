import {BLC_INVALID} from "./reasons";
import {GET_METHOD, HEAD_METHOD} from "./methods";
import {HTTPError, stream as streamHTTP} from "got";
//import isPromise from "is-promise";
import isURL from "isurl";
import tunnel from "auto-tunnel";



const ERROR_EVENT = "error";
const REDIRECT_EVENT = "redirect";
const RESPONSE_EVENT = "response";



/**
 * Cache a response if its URL has not already been cached.
 * @param {object} response
 * @param {URLCache} cache
 */
const cacheResponse = (response, cache) =>
{
	// @todo is this check necessary?
	if (!cache.has(response.url))
	{
		cache.set(response.url, response);
	}
};



/**
 * Create an HTTP request.
 * @param {URL} url
 * @param {object} auth
 * @param {string} method
 * @param {object} options
 * @param {boolean} [retry]
 * @returns {Promise<object>}
 */
const requestURL = (url, auth, method, options, retry=false) => new Promise((resolve, reject) =>
{
	const headers = { "user-agent":options.userAgent };
	const redirects = [];

	streamHTTP(url,
	{
		agent: tunnel(url, { proxyHeaders:headers }),
		auth: stringifyAuth(url, auth),
		headers,
		method,
		rejectUnauthorized: false,  // accept self-signed SSL certificates
		retries: 0
	})
	.on(ERROR_EVENT, error =>
	{
		if (error.statusCode===405 && method===HEAD_METHOD && options.retry405Head && !retry)
		{
			// Retry potentially broken server with GET_METHOD
			resolve( requestURL(url, auth, GET_METHOD, options, true) );
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
	.on(REDIRECT_EVENT, stream => redirects.push( simplifyResponse(stream) ))
	.on(RESPONSE_EVENT, stream =>
	{
		const response = simplifyResponse(stream, redirects);

		switch (method)
		{
			case GET_METHOD:
			{
				resolve({ response, stream });
				break;
			}
			case HEAD_METHOD:
			{
				resolve({ response });
				break;
			}
		}
	});
});



/**
 * Create a simple response object from that of the "http" module.
 * @param {object|Stream} response
 * @param {Array<object>} [redirects]
 * @returns {object}
 * @todo add response time
 */
const simplifyResponse = ({headers, statusCode, statusMessage, url}, redirects) =>
({
	headers,
	status: statusCode,
	statusText: statusMessage,
	url: new URL(url),
	...(redirects && {redirects})
});



/**
 * Convert an HTTP authentication URL or object into a string.
 * @param {URL} url
 * @param {object} auth
 * @returns {string}
 */
const stringifyAuth = (url, auth) =>
{
	if (url.password!=="" || url.username!=="")
	{
		return `${url.username}:${url.password}`;
	}
	else if (auth.password!=="" || auth.username!=="")
	{
		return `${auth.username}:${auth.password}`;
	}
};



/**
 * Create an HTTP request and cache the response.
 * @param {URL} url
 * @param {object} auth
 * @param {string} method
 * @param {URLCache} cache
 * @param {object} options
 * @throws {TypeError} non-URL
 * @returns {Promise<object>}
 * @todo use `Promise.try()` instead of `async` ?
 */
export default async (url, auth, method, cache, options) =>
{
	if (!isURL.lenient(url))
	{
		throw new TypeError(BLC_INVALID);
	}
	else
	{
		const promise = requestURL(url, auth, method.toLowerCase(), options);

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
				// @todo replace cached promise?
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
