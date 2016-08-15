"use strict";
const {errors}   = require("./messages");
const requestUrl = require("./requestUrl");

const promiseTry = require("es6-promise-try");



function checkErrors(response)
{
	if (response.status<200 || response.status>299)
	{
		const error = new Error(errors.HTML_RETRIEVAL);
		error.code = response.status;
		return error;
	}

	const type = response.headers["content-type"];

	// Content-type is not mandatory in HTTP spec
	if (type==null || !type.startsWith("text/html"))
	{
		const error = new Error(errors.EXPECTED_HTML(type));
		error.code = response.status;
		return error;
	}
}



/*
	Request a URL for its HTML contents and return a stream.
*/
function streamHtml(url, auth, cache, options)
{
	return promiseTry(() =>
	{
		let output;

		const request = requestUrl(url, auth, "get", options).then(result =>
		{
			output = checkErrors(result.response);

			if (output === undefined)
			{
				output = result;

				// Send response of redirected URL to cache
				// TODO :: use "url-relation"
				if (options.cacheResponses && result.response.url!==url.href)
				{
					// Will always overwrite previous value
					cache.set(result.response.url, result.response);
				}
			}

			return result;
		})
		.catch(error => error);  // will be stored as a response

		// TODO :: this stores invalid urls too -- should avoid that?
		// Send response to cache -- it will be available to `cache.get()` before being resolved
		if (options.cacheResponses)
		{
			// Will always overwrite previous value
			cache.set(url, request);
		}

		// Send result to caller
		return request.then(result =>
		{
			if (result instanceof Error) throw result;
			if (output instanceof Error) throw output;

			return output;
		});
	});
}



module.exports = streamHtml;
