"use strict";



function simpleResponse(response)
{
	var simplified = simplify(response);
	simplified.redirects = [];
	
	for (var i=0; i<response.redirectHistory.length; i++)
	{
		simplified.redirects.push( simplify(response.redirectHistory[i]) );
	}
	
	return simplified;
}



function simplify(response)
{
	return {
		headers:       response.headers,
		httpVersion:   response.httpVersion,
		statusCode:    response.statusCode,
		statusMessage: response.statusMessage,
		url:           response.request.url
	};
}



module.exports = simpleResponse;
