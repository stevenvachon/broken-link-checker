import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import chaiSubset from "chai-subset";
import chaiThings from "chai-things";
import tagsString from "./tagsString";

export * from "./fixture";
export * from "./options";

export
{
	start as startServer,
	start as startServers,
	startDead as startDeadServer,
	startDead as startDeadServers,
	stop as stopServers
} from "./server";

// @todo https://github.com/tc39/proposal-export-default-from
export {tagsString};



chai
.use(chaiAsPromised)
.use(chaiSubset)
.use(chaiThings)
.config.includeStack = true;



export const defaultAuth = Object.freeze(
{
	password: "",
	username: ""
});



export class ExpectedError extends Error
{
	constructor()
	{
		super("This was thrown so that it could be caught");
	}
}



export const simplifyLink = link => link.toJSON();

export const simplifyLinks = links => links.map(simplifyLink);

export const simplifyPageLinks = pages => pages.map(simplifyLinks);



export class WrongCallError extends Error
{
	constructor()
	{
		super("This should not have been called");
	}
}
