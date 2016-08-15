import DEFAULT_OPTIONS from "./defaultOptions";



/*
	Convert an Array to a boolean-value map (Object).

	["asdf1", "asdf2"]

	to

	{ asdf1:true, asdf2:true }
*/
const memoize = array => array.reduce((map, value) =>
{
	map[ value.toLowerCase() ] = true;
	return map;
}, {});



export default (options = {}) =>
{
	if (options.__parsed !== true)
	{
		options = { ...DEFAULT_OPTIONS, ...options };

		// Maps of this kind are easier to work with, but are not consumer-friendly
		options.acceptedSchemes = memoize(options.acceptedSchemes);
		options.excludedSchemes = memoize(options.excludedSchemes);

		options.requestMethod = options.requestMethod.toLowerCase();

		// Undocumented -- avoids reparsing options passed through from class to class
		options.__parsed = true;
	}

	return options;
};
