/* eslint-disable quote-props */
"use strict";

// eslint:recommended overrides
const overriddenRules =
{
	"no-mixed-spaces-and-tabs": [2, "smart-tabs"],
	"require-atomic-updates": 1  // usually not a problem
};

module.exports =
{
	env:
	{
		es6: true
	},
	extends:
	[
		"eslint:recommended",
		"plugin:you-dont-need-lodash-underscore/all"
	],
	parserOptions:
	{
		ecmaVersion: 2019
	},
	plugins:
	[
		"jsdoc",
		"sort-destructure-keys",
		"you-dont-need-lodash-underscore"
	],
	root: true,
	rules:
	{
		...overriddenRules,

		"arrow-parens": [2, "as-needed"],
		"brace-style": [2, "allman"],
		"camelcase": 2,
		"comma-dangle": 2,
		"comma-style": 2,
		"curly": 2,
		"dot-notation": [2, {allowKeywords:true}],
		"eol-last": 2,
		"eqeqeq": [2, "always", {null:"ignore"}],
		"func-call-spacing": [2, "never"/*, {allowNewlines:true}*/],
		//"indent": [2, "tab", {MemberExpression:0}],
		"jsdoc/check-alignment": 2,
		"jsdoc/check-param-names": 2,
		"jsdoc/check-syntax": 2,
		"jsdoc/check-tag-names": 2,
		"jsdoc/check-types": 2,
		//"jsdoc/no-undefined-types": 2,
		//"jsdoc/require-jsdoc": 2,
		"jsdoc/require-param": 2,
		"jsdoc/require-param-name": 2,
		"jsdoc/require-param-type": 2,
		"jsdoc/require-returns": 2,
		"jsdoc/require-returns-check": 2,
		"jsdoc/require-returns-type": 2,
		"jsdoc/valid-types": 2,
		"keyword-spacing": 2,
		"new-parens": 2,
		"no-array-constructor": 2,
		"no-caller": 2,
		"no-console": 2,
		"no-debugger": 2,
		"no-eval": 2,
		"no-extra-boolean-cast": 2,
		"no-floating-decimal": 2,
		"no-implied-eval": 2,
		"no-label-var": 2,
		"no-labels": [2, {allowLoop:true}],
		"no-lone-blocks": 2,
		"no-loop-func": 2,
		"no-multi-str": 2,
		"no-native-reassign": 2,
		"no-nested-ternary": 2,
		"no-new-func": 2,
		"no-new-object": 2,
		"no-new-wrappers": 2,
		"no-octal-escape": 2,
		"no-process-exit": 2,
		"no-proto": 2,
		"no-restricted-globals": [2, {message:"Use setTimeout", name:"setInterval"}],
		"no-restricted-properties": [2, {message:"Use setTimeout", object:"window", property:"setInterval"}],
		"no-sequences": 2,
		"no-shadow-restricted-names": 2,
		"no-trailing-spaces": 2,
		"no-undef": 2,
		"no-undef-init": 2,
		"no-unused-vars": [2, {args:"after-used"}],
		"no-useless-concat": 2,
		"no-var": 2,
		"no-with": 2,
		"object-shorthand": 2,
		"one-var": [2, {initialized:"never", uninitialized:"consecutive"}],
		"prefer-arrow-callback": 2,
		"prefer-const": 2,
		"prefer-destructuring":
		[
			2,
			{
				AssignmentExpression: {array:false, object:false},
				VariableDeclarator: {array:false, object:true}
			}/*,
			{enforceForRenamedProperties:true}*/
		],
		"prefer-object-spread": 2,
		"prefer-rest-params": 2,
		"prefer-spread": 2,
		"prefer-template": 2,
		"quote-props": [2, "as-needed"],
		"quotes": [2, "double", {allowTemplateLiterals:true, avoidEscape:true}],
		"radix": 2,
		"semi": [2, "always", {omitLastInOneLineBlock:true}],
		"semi-spacing": [2, {after:true, before:false}],
		"sort-destructure-keys/sort-destructure-keys": [2, {caseSensitive:false}],
		"sort-keys": [2, "asc", {caseSensitive:false, natural:true}],
		"sort-vars": [2, {ignoreCase:true}],
		"space-before-blocks": 2,
		"space-before-function-paren": [2, {anonymous:"never", asyncArrow:"always", named:"never"}],
		"space-unary-ops": [2, {nonwords:false, words:true}],
		"yoda": 2
	}
};
