"use strict";
const {engines: {node:nodeVersion}} = require("../package.json");



module.exports =
{
	plugins:
	[
		"@babel/proposal-export-namespace-from",
		"@babel/plugin-syntax-class-properties",
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
