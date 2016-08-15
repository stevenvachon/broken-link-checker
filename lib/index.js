"use strict";
const {reasons} = require("./internal/messages");



const blc =
{
	HtmlChecker:    require("./public/HtmlChecker"),
	HtmlUrlChecker: require("./public/HtmlUrlChecker"),
	SiteChecker:    require("./public/SiteChecker"),
	UrlChecker:     require("./public/UrlChecker")
};



Object.assign(blc, reasons);



module.exports = Object.freeze(blc);
