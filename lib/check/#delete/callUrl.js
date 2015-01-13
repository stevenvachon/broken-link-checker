"use strict";
var request = require("request");



function callUrl(url, callback)
{
	callUrls([url], function(responses)
	{
		callback( responses[0] );
	})
}



function callUrls(urls, callback)
{
	var count = 0;
	var responses = new Array(urls.length);
	
	urls.forEach( function(url, i)
	{
		request(url, function(error, response)
		{
			var broken = true;
			
			if (!error)
			{
				broken = response.status !== 200;
				
				/*if( response.status == 404) {
				    // perform error callback
				}else if( response.status == 200) {
				    if( page.source == 404.source) {
				        // perform error callback
				    }else {
				        // perform OK callback
				    }
				}*/
			}
			
			responses[i] = 
			{
				url: url,
				broken: broken,
				response: error || response
			};
			
			// If all responses received
			if (++count >= responses.length)
			{
				callback(responses);
			}
		});
	});
}



module.exports = callUrl;
