import {errors} from "./messages";
import requestHttp from "./requestHttp";



const {EXPECTED_HTML, HTML_RETRIEVAL} = errors;



/*
	Request a URL for its HTML contents and return a stream.
*/
export default async (url, auth, cache, options) =>
{
	const result = await requestHttp(url, auth, "get", cache, options);
	const {response: {headers, status}} = result;

	if (status<200 || status>299)
	{
		const error = new Error(HTML_RETRIEVAL);
		error.code = status;
		throw error;
	}
	else
	{
		const type = headers["content-type"];

		// Content-type is not mandatory in HTTP spec
		if (!type?.startsWith("text/html"))
		{
			const error = new Error(EXPECTED_HTML(type));
			error.code = status;
			throw error;
		}
	}

	return result;
};
