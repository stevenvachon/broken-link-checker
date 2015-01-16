"use strict";



function logLinkObj(linkObj)
{
	linkObj.response = {};	// for easier logging
	console.log(linkObj);
}



module.exports = 
{
	logLinkObj: logLinkObj
};
