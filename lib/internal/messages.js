"use strict";
var errno = require("errno").code;
var statusCodes = require("http").STATUS_CODES;

var i;

var errors = 
{
	EXPECTED_HTML: function(type)
	{
		type = type==null ? type : '"'+type+'"';
		return 'Expected type "text/html" but got '+type;
	},
	HTML_RETRIEVAL: "HTML could not be retrieved"
};

var reasons =
{
	//BLC_CUSTOM: "Custom Exclusion",
	BLC_EXTERNAL: "External URL Exclusion",
	BLC_INTERNAL: "Internal URL Exclusion",
	BLC_HTML: "HTML Exclusion",
	BLC_INVALID: "Invalid URL",
	BLC_KEYWORD: "Keyword Exclusion",
	//BLC_LOCALPATH: "Local File Path Exclusion",
	BLC_ROBOTS: "Robots Exclusion",
	BLC_SAMEPAGE: "Same-page URL Exclusion",
	BLC_SCHEME: "Scheme Exclusion",
	BLC_UNKNOWN: "Unknown Error",
	
	ERRNO_ENOTFOUND: "no matching dns record (ENOTFOUND)"
};



for (i in errno)
{
	reasons["ERRNO_"+i] = errno[i].description +" ("+i+")";
}



for (i in statusCodes)
{
	reasons["HTTP_"+i] = statusCodes[i] +" ("+i+")";
}



module.exports = 
{
	errors: errors,
	reasons: reasons
};
