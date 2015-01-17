"use strict";



function linkObj(url)
{
	return {
		url: (url !== undefined) ? url : null,
		resolvedUrl: null,
		
		broken: null,
		error: null,
		response: null,
		
		index: null,
		tagName: null,
		attrName: null,
		text: null,
		tag: null,
		
		// temp keys
		attrs: null,
		selfClosing: null
	};
}



linkObj.clean = function(link)
{
	delete link.attrs;
	delete link.selfClosing;
}



module.exports = linkObj;
