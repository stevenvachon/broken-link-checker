"use strict";



function linkObj(url)
{
	return {
		url: url || null,
		resolvedUrl: null,
		
		broken: null,
		error: null,
		response: null,
		
		tagName: null,
		attrName: null,
		//text: null,
		tag: null,
		temp: null
	};
}



module.exports = linkObj;
