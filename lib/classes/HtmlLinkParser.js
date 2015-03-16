"use strict";
var callHandler = require("../common/callHandler");

var parse5 = require("parse5");



function HtmlLinkParser(options, handlers)
{
	// No, this is not Underscore.js ;) -- it's just short
	var _ = this;
	
	// Parse session variables
	_.base = {};
	_.elementStack = [];
	_.linkCount = 0;
	_.linkElementsStack = [];
	
	// Per-link variables
	_.links = [];
	_.selector = "";
	_.voidElement = false;
	
	// User input variables
	this.handlers = handlers || {};
	this.options = options;
	
	this.parser = new parse5.SimpleApiParser(
	{
		startTag: handler_startTag.bind(this),
		endTag:   handler_endTag.bind(this),
		text:     handler_text.bind(this)
	});
}



HtmlLinkParser.prototype.parse = function(html)
{
	reset(this);
	
	this.parser.parse(html);
	
	callHandler.sync(thisObj.handlers.complete, null);
};



//::: PRIVATE FUNCTIONS (with scope)



function handler_endTag(tagName)
{
	
}



function handler_startTag(tagName, attrs, selfClosing)
{
	
}



function handler_text(text)
{
	
}



//::: PRIVATE FUNCTIONS (with no scope)



/*
	Reset instance variables for next parse.
	
	`_` is a reference to an instance of HtmlLinkParser.
*/
function reset(_)
{
	_.base.baseChecked = false;
	_.base.headChecked = false;
	_.base.headOpen = false;
	_.base.value = undefined;
	
	_.elementStack.length = 0;
	_.elementStack.push({ tagName:"__DOCUMENT", children:0 });
	
	_.linkCount = 0;
	
	_.linkElementsStack.length = 0;
	
	// Per-link variables
	_.links.length = 0;
	_.selector = "";
	_.voidElement = false;
}



module.exports = HtmlLinkParser;
