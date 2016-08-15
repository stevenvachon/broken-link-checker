import DEFAULT_OPTIONS from "./defaultOptions";



const HAS_BEEN_PARSED_VALUE = Symbol();



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

		// https://npmjs.com/request-methods-constants are upper case
		options.requestMethod = options.requestMethod.toUpperCase();

		// Undocumented -- avoids reparsing options passed through from class to class
		options.__parsed = HAS_BEEN_PARSED_VALUE;
	}

	return options;
};
