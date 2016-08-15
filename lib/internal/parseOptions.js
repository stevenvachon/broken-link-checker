import DEFAULT_OPTIONS from "./defaultOptions";



const HAS_BEEN_PARSED_VALUE = Symbol();



/**
 * Convert an Array to a map (object) of keys.
 * @param {Array} array
 * @returns {object}
 * @example
 * memoize(["asdf1", "asdf2"]);
 * //-> { asdf1, asdf2 }
 */
const memoizeArray = array => array.reduce((map, value) =>
{
	map[ value.toLowerCase() ] = true;
	return map;
}, {});



/**
 * Combine consumer options with defaults, then normalize/optimize.
 * @param {object} [options]
 * @returns {object}
 */
export default (options = {}) =>
{
	if (options.__parsed !== HAS_BEEN_PARSED_VALUE)
	{
		options = { ...DEFAULT_OPTIONS, ...options };

		// Maps of this kind are easier to work with, but are not consumer-friendly
		options.acceptedSchemes = memoizeArray(options.acceptedSchemes);
		options.excludedSchemes = memoizeArray(options.excludedSchemes);

		options.requestMethod = options.requestMethod.toLowerCase();

		// Undocumented -- avoids reparsing options passed through from class to class
		options.__parsed = HAS_BEEN_PARSED_VALUE;
	}

	return options;
};
