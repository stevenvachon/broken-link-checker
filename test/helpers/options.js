import appDefaultOptions from "../../lib/internal/defaultOptions";
import deepFreeze from "deep-freeze-node";
import parseOptions from "../../lib/internal/parseOptions";



export const parsedOptions = overrides => deepFreeze(parseOptions(testOptions(overrides)));

export const rawOptions = overrides => deepFreeze(testOptions(overrides));



const testDefaultOptions =
{
	// All other options will use default values
	// as this will ensure that when they change, tests WILL break
	cacheResponses: false,
	filterLevel: 3,
	honorRobotExclusions: false,
	maxSocketsPerHost: Infinity,
	retryHeadFail: false
};



const testOptions = overrides =>
({
	...appDefaultOptions,
	...testDefaultOptions,
	...overrides
});
