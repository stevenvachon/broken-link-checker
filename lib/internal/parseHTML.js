import defaultTreeAdapter from "parse5/lib/tree-adapters/default";
import isStream from "is-stream";
import isString from "is-string";
import {parse} from "parse5";
import ParserStream from "parse5-parser-stream";
import {PassThrough} from "stream";



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
			result.attrMap = memoizeAttrs(result.attrs);
			return result;
		}
	}
};



/**
 * Convert a list of parse5 attributes into key-value pairs.
 * Note: spec-compliant HTML cannot have multiple attrs of the same name.
 * @param {Array} attrs
 * @returns {object}
 */
const memoizeAttrs = attrs => attrs.reduce((result, {name, value}) =>
{
	result[name] = value;
	return result;
}, {});



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
		.once(FINISH_EVENT, () => resolve(parser.document));

		// @todo https://github.com/sindresorhus/got/issues/834
		const toStringChunks = new PassThrough({ encoding:"utf8" });

		input.pipe(toStringChunks).pipe(parser);
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
