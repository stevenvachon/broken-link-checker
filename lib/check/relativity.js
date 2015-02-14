"use strict";



function internal(url1, url2)
{
	return url1.protocol===url2.protocol &&
	       url1.auth===url2.auth &&
	       url1.host===url2.host &&
	       url1.port===url2.port;
}



function samePage(url1, url2, internalOverride)
{
	var isInternal = internalOverride===undefined ? internal(url1,url2) : internalOverride;
	
	return isInternal &&
	       url1.path===url2.path &&
	       url1.query===url2.query;
}



module.exports = 
{
	internal: internal,
	samePage: samePage
};
