"use strict";
const {engines: {node:nodeVersion}} = require("../package.json");



module.exports =
{
	plugins:
	[
		"@babel/proposal-class-properties",
		"@babel/proposal-nullish-coalescing-operator",
		"@babel/proposal-numeric-separator",
		"@babel/proposal-optional-catch-binding",
		"@babel/proposal-optional-chaining",
		"@babel/proposal-private-methods",
		"add-module-exports"
	],
	presets:
	[
		["@babel/preset-env",
		{
			targets:
			{
				browsers: `node ${nodeVersion}`
			}
		}]
	]
};
