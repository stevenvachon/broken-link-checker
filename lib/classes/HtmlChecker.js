"use strict";
var callHandler  = require("../common/callHandler");
var parseOptions = require("../common/parseOptions");

var checkUrl = require("../static/checkUrl");

var HtmlLinkParser = require("./HtmlLinkParser");



function HtmlChecker(options, handlers)
{
	var thisObj = this;
	
	this.active = false;
	this.handlers = handlers || {};
	this.linkCount = 0;
	this.options = parseOptions(options);
	this.resultCount = 0;
	
	this.parser = new HtmlLinkParser(this.options,
	{
		link: function(link)
		{
			thisObj.linkCount++;
			
			checkUrl(link, thisObj.options, function(result)
			{
				callHandler.sync(thisObj.handlers.link, result);
				
				if (++thisObj.resultCount >= thisObj.linkCount)
				{
					callHandler.sync(thisObj.handlers.complete, null);
				}
			});
		},
		complete: function()
		{
			// If no links found
			if (thisObj.linkCount === 0)
			{
				callHandler.async(thisObj.handlers.complete, null);
			}
		}
	});
}



HtmlChecker.prototype.scan = function(html)
{
	if (this.active === false)
	{
		this.active = true;
		
		// Reset for next parse
		this.linkCount = 0;
		this.resultCount = 0;
		
		this.parser.parse(html);
		
		return true;
	}
	else
	{
		return false;
	}
};



module.exports = HtmlChecker;
