import {code as ERRNO} from "errno";
import {STATUS_CODES as HTTP} from "http";



export const errors = Object.freeze(
{
	EXPECTED_HTML: (type = "") =>
	{
		type = type==="" ? "" : ` but got "${type}"`;
		return `Expected type "text/html"${type}`;
	},
	HTML_RETRIEVAL: "HTML could not be retrieved"
});



export const reasons = Object.freeze(
{
	BLC_CUSTOM: "Custom Exclusion",
	BLC_EXTERNAL: "External URL Exclusion",
	BLC_HTML: "HTML Exclusion",
	BLC_INTERNAL: "Internal URL Exclusion",
	BLC_INVALID: "Invalid URL",
	BLC_KEYWORD: "Keyword Exclusion",
	//BLC_LOCALPATH: "Local File Path Exclusion",
	BLC_ROBOTS: "Robots Exclusion",
	BLC_SAMEPAGE: "Same-page URL Exclusion",
	BLC_SCHEME: "Scheme Exclusion",
	BLC_UNKNOWN: "Unknown Error",

	ERRNO_ENOTFOUND: "no matching dns record (ENOTFOUND)",

	...Object.entries(ERRNO).reduce((result, [key, value]) =>
	{
		result[`ERRNO_${key}`] = `${value.description} (${key})`;
		return result;
	}, {}),

	...Object.entries(HTTP).reduce((result, [key, value]) =>
	{
		result[`HTTP_${key}`] = `${value} (${key})`;
		return result;
	}, {})
});
