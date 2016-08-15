/* eslint-disable quote-props */
"use strict";
const base = require("./eslintrc.base");
const {merge} = require("lodash");



module.exports = merge(base,
{
	env:
	{
		node: true
	},
	rules:
	{
		"no-new-require": 2,
		"strict": 2
	}
});
