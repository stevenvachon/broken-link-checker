"use strict";
var request = require("request");



/*
	Make multiple HTTP requests. A callback is invoked upon completion
	containing an array of results corresponding to each request.
*/
function requests(uris, config)
{
	/*if (!config.requestOptions)
	{
		config.requestOptions = {};
	}*/
	
	var singular = Array.isArray(uris) === false;
	
	// Force multiple
	if (singular === true)
	{
		if (typeof uris !== "string")
		{
			// Nothing to work with
			// TODO :: waht to return? what about an error?
			config.oncomplete(null);
		}
		
		uris = [uris];
	}
	else if (uris.length === 0)
	{
		// Nothing to work with
		config.oncomplete([]);
	}
	
	var count = 0;
	var results = new Array(uris.length);
	
	uris.forEach( function(uri, i)
	{
		var uri_org = uri;
		
		// External URI checking
		if (config.oniterate)
		{
			uri = config.oniterate(uri);
		}
		
		// Must be a string to continue
		if (typeof uri !== "string")
		{
			results[i] = 
			{
				url: uri_org,
				error: new Error("invalid url"),
				response: undefined
			};
			
			// If last response received
			if (++count >= results.length)
			{
				config.oncomplete( singular===false ? results : results[0] );
			}
			
			// Move onto next uri
			return;
		}
		
		request(
		{
			uri: uri,
			timeout: 20000
		},
		function(error, response)
		{
			results[i] = 
			{
				url: uri,
				error: error,
				response: response
			};
			
			if (config.onresponse)
			{
				config.onresponse( results[i] );
			}
			
			// If all responses received
			if (++count >= results.length)
			{
				config.oncomplete( singular===false ? results : results[0] );
			}
		});
	});
}



module.exports = requests;
