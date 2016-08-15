"use strict";
const base = require("./eslintrc.base.js");
const {merge} = require("lodash");



module.exports = merge(base,
{
	env:
	{
		node: true
	}
});
