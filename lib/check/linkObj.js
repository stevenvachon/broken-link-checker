"use strict";



function linkObj(url, base)
{
	return {
		url:
		{
			original: (typeof url === "string") ? url : null,
			resolved: null
		},
		
		base:
		{
			original: (typeof base === "string") ? base : null,
			resolved: null
		},
		
		html:
		{
			index: null,
			tagName: null,
			attrName: null,
			attrs: null,
			text: null,
			tag: null,
			
			// temp keys
			attrMap: null,
			base: null,
			selfClosing: null,
			voidElement: null
		},
		
		broken: null,
		error: null,
		response: null
	};
}



linkObj.clean = function(link)
{
	// No further need for array syntax
	link.html.attrs = link.html.attrMap;
	
	delete link.html.attrMap;
	delete link.html.base;
	delete link.html.selfClosing;
	delete link.html.voidElement;
};



module.exports = linkObj;
