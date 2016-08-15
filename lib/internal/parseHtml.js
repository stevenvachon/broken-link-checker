import isStream from "is-stream";
import isString from "is-string";
import {parse, ParserStream, treeAdapters} from "parse5";



const {default:defaultTreeAdapter} = treeAdapters;

const options =
{
	locationInfo: true,
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



/*
	Convert attributes Array to a map (Object).

	Note: parse5 will have already handled multiple attrs of the
	same name.
*/
const memoizeAttrs = attrs => attrs.reduce((map, attr) =>
{
	map[attr.name] = attr.value;
	return map;
}, {});



/*
	Parse an HTML stream/string and return a tree.
*/
export default input => new Promise((resolve, reject) =>
{
	if (isStream(input))
	{
		const parser = new ParserStream(options)
		.once("finish", () => resolve(parser.document));

		input.pipe(parser);
	}
	else if (isString(input))
	{
		resolve( parse(input, options) );
	}
	else
	{
		reject( new TypeError("Invalid input") );
	}
});
