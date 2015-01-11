"use strict";
var request = require("request");



function callUrl(url, callback)
{
	request(url, function(error, response, body)
	{
		/*if( response.status == 404) {
		    // perform error callback
		}else if( response.status == 200) {
		    if( page.source == 404.source) {
		        // perform error callback
		    }else {
		        // perfork OK callback
		    }
		}*/
		
		callback(error, response.statusCode!==200, response);
	})
}



module.exports = callUrl;
