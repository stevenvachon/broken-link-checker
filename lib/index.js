"use strict";
var reasons = require("./internal/messages").reasons;



var blc = 
{
	HtmlChecker:    require("./public/HtmlChecker"),
	HtmlUrlChecker: require("./public/HtmlUrlChecker"),
	SiteChecker:    require("./public/SiteChecker"),
	UrlChecker:     require("./public/UrlChecker")
};



for (var i in reasons)
{
	blc[i] = reasons[i];
}



module.exports = blc;
