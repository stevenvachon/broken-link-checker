"use strict";
const bhttp = require("bhttp");
const decompressResponse = require("decompress-response");
const isURL = require("isurl");
const promiseTry = require("es6-promise-try");
//const {stat} = require("fs");
const tunnel = require("auto-tunnel");
const {URL} = require("universal-url");



const authString = (url, auth) =>
{
	if (url.username!=="" || url.password!=="")
	{
		return `${url.username}:${url.password}`;
	}
	else
	{
		const password = auth.password != null ? auth.password : "";
		const username = auth.username != null ? auth.username : "";

		if (password!=="" || username!=="")
		{
			return `${username}:${password}`;
		}
	}
};



const requestUrl = (url, auth, method, options, retry=false) =>
{
	return promiseTry(() =>
	{
		// TODO :: do we need this?
		if (!isURL.lenient(url))
		{
			throw new TypeError("Invalid URL");
		}

		const headers = { "user-agent":options.userAgent };
		method = method.toLowerCase();

		return bhttp.request(url.href,  // TODO :: https://github.com/joepie91/node-bhttp/issues/3
		{
			agent: tunnel(url, { proxyHeaders:headers }),
			auth: authString(url, auth),
			discardResponse: method === "head",
			headers,
			method: method,
			rejectUnauthorized: false,  // accept self-signed SSL certificates
			stream: method !== "head"
		})
		.then(response =>
		{
			if (!retry && method==="head" && options.retryHeadFail && options.retryHeadCodes.includes(response.statusCode))
			{
				// Retry possibly broken server with "get"
				return requestUrl(url, auth, "get", options, true);
			}
			else if (method==="get" && !retry)
			{
				return { response:simplifyResponse(response), stream:decompressResponse(response) };
			}
			else
			{
				return { response:simplifyResponse(response) };
			}
		})
	});
};



const simplifyResponse = response =>
{
	const simplified = simplifyResponse2(response);

	simplified.redirects = response.redirectHistory.map(redirect => simplifyResponse2(redirect));

	return simplified;
};



// TODO :: add response time
const simplifyResponse2 = response =>
({
	headers:    response.headers,
	status:     response.statusCode,
	statusText: response.statusMessage,
	url:        new URL(response.request.url)
});



module.exports = requestUrl;
