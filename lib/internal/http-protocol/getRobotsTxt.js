import {BLC_INVALID} from "../reasons";
import {GET} from "http-methods-constants";
import guard from "robots-txt-guard";
import isURL from "isurl";
import parse from "robots-txt-parse";
import request from "./request";



/**
 * Download and parse a robots.txt file from a server's root path.
 * @param {URL} url
 * @param {object} auth
 * @param {URLCache} cache
 * @param {object} options
 * @throws {TypeError} non-URL
 * @returns {Promise<guard>}
 */
export default async (url, auth, cache, options) =>
{
	if (!isURL(url))
	{
		throw new TypeError(BLC_INVALID);
	}
	else
	{
		url = new URL(url);
		url.hash = "";
		url.pathname = "/robots.txt";
		url.search = "";

		const {stream} = await request(url, auth, GET, cache, options);

		// @todo https://github.com/tc39/proposal-pipeline-operator
		return guard(await parse(stream));
	}
};
