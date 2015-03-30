"use strict";
var callHandler    = require("../common/callHandler");
var getHtmlFromUrl = require("../common/getHtmlFromUrl");

var checkHtml = require("./checkHtml");



function checkHtmlUrl(url, options, handlers)
{
	getHtmlFromUrl(url, options, function(error, html, updatedOptions)
	{
		if (error !== null)
		{
			callHandler.sync(handlers.complete, error);
			return;
		}
		
		checkHtml(html, updatedOptions, handlers);
	});
}