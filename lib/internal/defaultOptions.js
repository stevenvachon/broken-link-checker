import deepFreeze from "deep-freeze-node";
import {HEAD_METHOD} from "./methods";
import {name as packageName, version as packageVersion} from "../../package.json";
import TAGS from "./tags";
import userAgent from "default-user-agent";



export default deepFreeze(
{
	acceptedSchemes: ["http:","https:"],  // @todo add "file:"
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
	maxSockets: Infinity,  // @todo change to `maxExternalSockets`
	maxSocketsPerHost: 1,  // @todo separate to `maxInternalSockets=5` and `maxExternalSocketsPerHost=1`
	rateLimit: 0,
	requestMethod: HEAD_METHOD,
	retry405Head: true,
	tags: TAGS,
	userAgent: userAgent(packageName, packageVersion)
});
