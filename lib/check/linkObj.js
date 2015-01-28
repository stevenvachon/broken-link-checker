"use strict";



function linkObj(url)
{
	return {
		url:
		{
			//base: null,
			original: (url !== undefined) ? url : null,
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
	delete link.html.selfClosing;
	delete link.html.voidElement;
};



module.exports = linkObj;
