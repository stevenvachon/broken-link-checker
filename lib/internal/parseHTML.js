import defaultTreeAdapter from "parse5/lib/tree-adapters/default";
import isStream from "is-stream";
import isString from "is-string";
import {parse} from "parse5";
import ParserStream from "parse5-parser-stream";



const ERROR_EVENT = "error";
const FINISH_EVENT = "finish";



const OPTIONS =
{
	sourceCodeLocationInfo: true,
	treeAdapter:
	{
		...defaultTreeAdapter,

		createElement: (...args) =>
		{
			const result = defaultTreeAdapter.createElement(...args);
			result.attrMap = simplifyAttrs(result.attrs);
			return result;
		}
	}
};



/**
 * Convert a list of parse5 attributes into key-value pairs.
 * Note: spec-compliant HTML cannot have multiple attrs of the same name.
 * @param {Array} attrs
 * @returns {object}
 *
 * @todo https://github.com/tc39/proposal-pipeline-operator
 */
const simplifyAttrs = attrs => Object.fromEntries(attrs.map(({name, value}) => [name, value]));



/**
 * Parse an HTML stream/string and return a tree.
 * @param {Stream|string} input
 * @throws {TypeError} non-Stream or non-string
 * @returns {Promise<object>}
 */
export default input => new Promise((resolve, reject) =>
{
	if (isStream(input))
	{
		const parser = new ParserStream(OPTIONS)
		.once(ERROR_EVENT, reject)  // @todo test this
		.once(FINISH_EVENT, () => resolve(parser.document));

		input
			.setEncoding("utf8")
			.pipe(parser);
	}
	else if (isString(input))
	{
		resolve( parse(input, OPTIONS) );
	}
	else
	{
		reject( new TypeError("Invalid input") );
	}
});
