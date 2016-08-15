import deepFreeze from "deep-freeze-node";
import {name, version} from "../../package.json";
import tags from "./tags";
import userAgent from "default-user-agent";



export default deepFreeze(
{
	acceptedSchemes: ["http:","https:"],  // TODO :: add "file:"
	cacheMaxAge: 3_600_000,
	cacheResponses: true,
	customFilter: () => true,
	excludedKeywords: [],
	excludedSchemes: ["data:","geo:","javascript:","mailto:","sms:","tel:"],
	excludeExternalLinks: false,
	excludeInternalLinks: false,
	excludeLinksToSamePage: false,
	filterLevel: 1,
	honorRobotExclusions: true,
	maxSockets: Infinity,  // TODO :: change to `maxExternalSockets`
	maxSocketsPerHost: 1,  // TODO :: separate to `maxInternalSockets=5` and `maxExternalSocketsPerHost=1`
	rateLimit: 0,
	requestMethod: "head",
	retry405Head: true,
	tags,
	userAgent: userAgent(name, version)
});
