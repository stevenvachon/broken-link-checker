"use strict";

// eslint:recommended overrides
const overriddenRules =
{
	"no-mixed-spaces-and-tabs": 0,
	"require-atomic-updates": 1  // usually not a problem
};

module.exports =
{
	env:
	{
		es6: true
	},
	extends: "eslint:recommended",
	parserOptions:
	{
		ecmaVersion: 2019
	},
	plugins:
	[
		"sort-destructure-keys"
	],
	root: true,
	rules:
	{
		...overriddenRules,

		"arrow-parens": [2, "as-needed"],
		"brace-style": [2, "allman"],
		"comma-dangle": 2,
		"curly": 2,
		"dot-notation": [2, {allowKeywords:true}],
		"eol-last": 2,
		"new-parens": 2,
		"no-array-constructor": 2,
		"no-caller": 2,
		"no-eval": 2,
		"no-extra-boolean-cast": 2,
		"no-floating-decimal": 2,
		"no-implied-eval": 2,
		"no-lone-blocks": 2,
		"no-nested-ternary": 2,
		"no-new-object": 2,
		"no-new-wrappers": 2,
		"no-octal-escape": 2,
		"no-shadow-restricted-names": 2,
		"no-trailing-spaces": 2,
		"no-undef": 2,
		"no-undef-init": 2,
		"no-unused-vars": [2, {args:"after-used"}],
		"no-useless-concat": 2,
		"no-var": 2,
		"no-with": 2,
		"object-shorthand": 2,
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
		"quotes": [2, "double", {allowTemplateLiterals:true, avoidEscape:true}],
		"radix": 2,
		"semi": [2, "always", {omitLastInOneLineBlock:true}],
		"sort-destructure-keys/sort-destructure-keys": [2, {caseSensitive:false}],
		"sort-keys": [2, "asc", {caseSensitive:false, natural:true}],
		"space-before-function-paren": [2, {anonymous:"never", asyncArrow:"always", named:"never"}],
		"strict": 2
	}
};
