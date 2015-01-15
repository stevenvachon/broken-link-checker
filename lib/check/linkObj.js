"use strict";



function linkObj(url)
{
	return {
		url: (url !== undefined) ? url : null,
		resolvedUrl: null,
		
		broken: null,
		error: null,
		response: null,
		
		tagName: null,
		attrName: null,
		//text: null,
		tag: null,
		
		temp: {}
	};
}



linkObj.clean = function(link)
{
	delete link.temp;
}



module.exports = linkObj;
