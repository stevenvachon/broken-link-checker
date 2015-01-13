"use strict";
var request = require("request");



/*
	Make multiple HTTP requests. A callback is invoked upon completion
	containing an array of results corresponding to each request.
*/
function requests(urls, config)
{
	var singular = Array.isArray(urls) === false;
	
	// Force multiple
	if (singular === true)
	{
		if (typeof urls !== "string")
		{
			// Nothing to work with
			// TODO :: waht to return? what about an error?
			config.oncomplete(null);
		}
		
		urls = [urls];
	}
	else if (urls.length === 0)
	{
		// Nothing to work with
		config.oncomplete([]);
	}
	
	var count = 0;
	var results = new Array(urls.length);
	
	urls.forEach( function(url, i)
	{
		var url_org = url;
		
		// External URL checking
		if (config.oniterate)
		{
			url = config.oniterate(url);
		}
		
		// Must be a string to continue
		if (typeof url !== "string")
		{
			results[i] = 
			{
				url: url_org,
				error: new Error("invalid url"),
				response: undefined
			};
			
			// If last response received
			if (++count >= results.length)
			{
				config.oncomplete( singular===false ? results : results[0] );
			}
			
			// Move onto next url
			return;
		}
		
		request(url, function(error, response)
		{
			results[i] = 
			{
				url: url,
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
