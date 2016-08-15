import {code as ERRNO} from "errno";
import {STATUS_CODES as HTTP} from "http";



export default Object.freeze(
{
	BLC_CUSTOM: "Custom Exclusion",
	//BLC_FILESSYTEM: "File System Path Exclusion",
	BLC_HTML: "HTML Exclusion",
	BLC_INVALID: "Invalid URL",
	BLC_KEYWORD: "Keyword Exclusion",
	BLC_LOCAL: "Local URL Exclusion",
	BLC_REMOTE: "Remote URL Exclusion",
	BLC_ROBOTS: "Robots Exclusion",
	BLC_SAMEPAGE: "Same-page URL Exclusion",
	BLC_SCHEME: "Scheme Exclusion",
	BLC_UNKNOWN: "Unknown Error",

	ERRNO_ENOTFOUND: "no matching dns record (ENOTFOUND)",

	// @todo https://github.com/tc39/proposal-pipeline-operator
	...Object.fromEntries
	(
		Object.entries(ERRNO).map(([key, {description}]) => [`ERRNO_${key}`, `${description} (${key})`])
	),

	// @todo https://github.com/tc39/proposal-pipeline-operator
	...Object.fromEntries
	(
		Object.entries(HTTP).map(([key, value]) => [`HTTP_${key}`, `${value} (${key})`])
	)
});
