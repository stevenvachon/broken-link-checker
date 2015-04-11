"use strict";



/*
	Convert request.js "invalid uri" error to this library's version of the same
	for consistency. This library only works with URL-type URIs.
	
	If different type of error, return original.
	If no error passed as input, return new error.
*/
function invalidUrlError(error)
{
	var createNew = true;
	
	if (error instanceof Error)
	{
		createNew = error.message.indexOf("Invalid URI") === 0;
	}
	
	if (createNew === true)
	{
		error = new Error("Invalid URL");
	}
	
	return error;
}



module.exports = invalidUrlError;
