import guard from "robots-txt-guard";
import isURL from "isurl";
import parse from "robots-txt-parse";
import {reasons} from "./messages";
import requestHttp from "./requestHttp";



const {BLC_INVALID} = reasons;



export default async (url, auth, cache, options) =>
{
	if (!isURL.lenient(url))
	{
		throw new TypeError(BLC_INVALID);
	}
	else
	{
		url = new URL(url);
		url.hash = "";
		url.pathname = "/robots.txt";
		url.search = "";

		const {stream} = await requestHttp(url, auth, "get", cache, options);

		// TODO :: https://github.com/tc39/proposal-pipeline-operator
		return guard(await parse(stream));
	}
};
