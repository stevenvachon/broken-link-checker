"use strict";



function areInternal(url1, url2)
{
	// If no protocols, it's impossible to determine if they link to the same server
	if (url1.protocol===null || url2.protocol===null)
	{
		return null;
	}
	
	return url1.protocol===url2.protocol &&
	       url1.auth===url2.auth &&
	       url1.host===url2.host &&
	       url1.port===url2.port;
}



function areSamePage(url1, url2, internalOverride)
{
	var isInternal = internalOverride===undefined ? areInternal(url1,url2) : internalOverride;
	
	// If internal could not be determined, than neither can same page
	if (isInternal === null)
	{
		return null;
	}
	
	return isInternal===true &&
	       url1.path===url2.path &&
	       url1.query===url2.query;
}



module.exports = 
{
	areInternal: areInternal,
	areSamePage: areSamePage
};
