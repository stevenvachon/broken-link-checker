/* eslint-disable quote-props */
"use strict";
const base = require("./eslintrc.base");
const {mergeWith} = require("lodash");



// This is annoying
const customizer = (objValue, srcValue) =>
{
	if (Array.isArray(objValue))
	{
		return [...objValue, ...srcValue];
	}
};



module.exports = mergeWith(base,
{
	env:
	{
		node: true
	},
	parser: "babel-eslint",
	parserOptions:
	{
		sourceType: "module"
	},
	plugins:
	[
		"import"
	],
	rules:
	{
		"import/extensions": [2, "ignorePackages", {js:"never"}],
		"import/first": 2,
		"import/no-duplicates": 2,
		"sort-imports": [2, {ignoreCase:true, ignoreDeclarationSort:true}]
	}
}, customizer);
