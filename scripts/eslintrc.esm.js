/* eslint-disable quote-props */
"use strict";



module.exports =
{
	env:
	{
		node: true
	},
	extends:
	[
		"./eslintrc.base.js"
	],
	parser: "@babel/eslint-parser",
	parserOptions:
	{
		babelOptions:
		{
			configFile: `${__dirname}/babel.config.js`
		},
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
};
