import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import chaiSubset from "chai-subset";
import chaiThings from "chai-things";
import {fixturePath, fixtureStream, fixtureString} from "./fixture";
import {parsedOptions, rawOptions} from "./options";
import {start, startDead, stop} from "./server";
import tagsString from "./tagsString";



chai
.use(chaiAsPromised)
.use(chaiSubset)
.use(chaiThings)
.config.includeStack = true;



export const defaultAuth =
{
	password: "",
	username: ""
};



export class ExpectedError extends Error
{
	constructor()
	{
		super("This was thrown so that it could be caught");
	}
}



export class WrongCallError extends Error
{
	constructor()
	{
		super("This should not have been called");
	}
}



// TODO :: https://github.com/tc39/proposal-export-default-from
export {fixturePath, fixtureStream, fixtureString};
export {parsedOptions, rawOptions};
export {startDead as startDeadServer};
export {startDead as startDeadServers};
export {start as startServer};
export {start as startServers};
export {stop as stopServers};
export {tagsString};
